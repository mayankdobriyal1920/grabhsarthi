import pool from "./connection.js";
import {updateCommonApiCall} from "./helpers/commonModelHelper.js";
import { SpacesServiceClient } from "@google-apps/meet";
import { GoogleAuth, OAuth2Client } from "google-auth-library";

async function getAuthClientFromDB(authData) {
    return new Promise((resolve) => {
        // Create OAuth2 client with stored tokens
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Set the credentials
        oauth2Client.setCredentials({
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            scope: authData.scope,
            token_type: 'Bearer',
            expiry_date: new Date(authData.token_expiry).getTime()
        });

        resolve(oauth2Client);
    });
}

// Function to refresh token if expired
async function refreshTokenIfNeeded(oauth2Client, authData) {
    try {
        // Check if token is expired or about to expire (within 5 minutes)
        const isExpired = !oauth2Client.credentials.expiry_date ||
            oauth2Client.credentials.expiry_date < Date.now() + 300000;

        if (isExpired) {
            console.log('Token expired or about to expire, refreshing...');

            // Refresh the token
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Update the database with new tokens
            const updateSql = `UPDATE gp_users SET access_token = ?, token_expiry = ? WHERE id = ?`;
            await new Promise((resolve, reject) => {
                pool.query(updateSql, [
                    credentials.access_token,
                    new Date(credentials.expiry_date).toISOString().slice(0, 19).replace('T', ' '),
                    authData.id
                ], (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                });
            });

            // Set the new credentials
            oauth2Client.setCredentials(credentials);
            console.log('Token refreshed successfully');

            return {
                oauth2Client,
                newAccessToken: credentials.access_token,
                newExpiry: credentials.expiry_date
            };
        }

        return { oauth2Client };
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}

function googleAuthFromOAuth2(oauth2) {
    const auth = new GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/meetings.space.created"]
    });

    auth.getClient = async () => oauth2;
    return auth;
}

async function createMeet(authClient) {
    try {
        const auth = googleAuthFromOAuth2(authClient);
        const client = new SpacesServiceClient({ auth });
        const [space] = await client.createSpace({});
        return space?.meetingUri;
    } catch (error) {
        console.error('Error creating Meet:', error);

        // Check if it's an auth error that might require token refresh
        if (error.message.includes('invalid_grant') ||
            error.message.includes('invalid_token') ||
            error.message.includes('token expired')) {
            throw new Error('AUTH_TOKEN_EXPIRED');
        }

        throw error;
    }
}

// ---------------- MAIN JOB ----------------
export async function actionToCreateAndUpdateDailyMeetLinks(trainer_id, clientAuth) {
    try {
        const authClient = await getAuthClientFromDB(clientAuth);

        // Refresh token if needed before starting the process
        const refreshResult = await refreshTokenIfNeeded(authClient, clientAuth);
        const refreshedAuthClient = refreshResult.oauth2Client;

        const sql = `SELECT id, title FROM live_classes WHERE trainer_id = ?`;
        pool.query(sql, [trainer_id], async (error, rows) => {
            if (error) {
                console.error('Database error:', error);
                return;
            }

            for (const row of rows) {
                try {
                    let meetLink;
                    let retryCount = 0;
                    const maxRetries = 2;

                    while (retryCount <= maxRetries) {
                        try {
                            meetLink = await createMeet(refreshedAuthClient);
                            break; // Success, break out of retry loop
                        } catch (e) {
                            if (e.message === 'AUTH_TOKEN_EXPIRED' && retryCount < maxRetries) {
                                console.log('Auth token expired, refreshing and retrying...');
                                // Refresh token and retry
                                const newRefreshResult = await refreshTokenIfNeeded(refreshedAuthClient, clientAuth);
                                refreshedAuthClient = newRefreshResult.oauth2Client;
                                retryCount++;
                                continue;
                            } else {
                                throw e; // Re-throw other errors or if max retries reached
                            }
                        }
                    }

                    if (!meetLink) {
                        console.error(`✗ No Meet link generated for class ${row.id}`);
                        continue;
                    }

                    console.log(`✓ Class ${row.id} updated with Meet link: ${meetLink}`);

                    const updateUser = {
                        column: 'meeting_link = ?',
                        value: [meetLink, row.id],
                        whereCondition: 'id = ?',
                        returnColumnName: 'id',
                        tableName: 'live_classes',
                    };

                    await updateCommonApiCall(updateUser);
                } catch (e) {
                    console.error(`✗ Failed creating link for class ${row.id}:`, e.message || e);

                    // If it's still an auth error after retries, we need to re-authenticate
                    if (e.message === 'AUTH_TOKEN_EXPIRED') {
                        console.error(`Authentication failed for trainer ${trainer_id}. Manual re-authentication required.`);
                        break; // Stop processing more classes for this trainer
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Utility function to check token status
export async function checkTokenStatus(authData) {
    try {
        const authClient = await getAuthClientFromDB(authData);
        const isExpired = !authClient.credentials.expiry_date ||
            authClient.credentials.expiry_date < Date.now();

        return {
            isValid: !isExpired,
            expiresIn: isExpired ? 0 : Math.floor((authClient.credentials.expiry_date - Date.now()) / 1000 / 60), // minutes
            needsRefresh: !authClient.credentials.expiry_date ||
                authClient.credentials.expiry_date < Date.now() + 300000 // 5 minutes
        };
    } catch (error) {
        console.error('Error checking token status:', error);
        return { isValid: false, expiresIn: 0, needsRefresh: true };
    }
}