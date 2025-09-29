// import {Vonage} from "@vonage/server-sdk";
import pool from "../connection.js";

// const vonage = new Vonage({
//     apiKey: "93669403",
//     apiSecret: "47hxkbdWHmxyaGFv"
// })
export const createNewSessionWithUserDataAndRole = async (req, userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (req?.session?.userSessionData) {
                const oldSessionId = req.session.id;

                // Destroy old session and regenerate a new one
                req.session.regenerate(async (err) => {
                    if (err) {
                        console.error("Error regenerating session:", err);
                        return reject(err);
                    }

                    try {
                        await deleteOldSessionFileFromSessionStore(oldSessionId);
                        await storeNewSessionFileFromSessionStore(req, userData);
                        resolve(true);
                    } catch (error) {
                        console.error("Error storing new session:", error);
                        reject(error);
                    }
                });
            } else {
                // No session exists, create a new one
                try {
                    await storeNewSessionFileFromSessionStore(req, userData);
                    resolve(true);
                } catch (error) {
                    console.error("Error storing session:", error);
                    reject(error);
                }
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            reject(error);
        }
    });
};

export async function deleteOldSessionFileFromSessionStore(oldSessionId) {
    let condition = `session_id = ?`; // Use parameterized placeholder
    let tableName = "sessions";
    await deleteCommonApiCall({ condition, tableName, values: [oldSessionId] });
}

export const insertCommonApiCall = (body) => {
    const { column, alias, tableName, values } = body;
    return new Promise((resolve, reject) => {
        // Construct the query with placeholders
        const query = `
            INSERT INTO ${tableName} (${column.toString()})
            VALUES (${alias.toString()});
        `;

        // Execute the query
        pool.query(query, values, (error,result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export async function deleteCommonApiCall({ condition, tableName, values }) {
    const query = `DELETE FROM ${tableName} WHERE ${condition};`;

    return new Promise((resolve, reject) => {
        pool.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.affectedRows); // Return the number of rows deleted
            }
        });
    });
}

export const updateCommonApiCall = (body) => {
    const { column, value, whereCondition, tableName } = body;
    try {
        return new Promise(function (resolve, reject) {
            // Construct the query with placeholders
            const query = `
                UPDATE ${tableName}
                SET ${column.toString()}
                WHERE ${whereCondition};
            `;

            // Execute the query
            pool.query(query, value, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    // Return success and the number of affected rows
                    let data = { success: 1, affectedRows: result.affectedRows };
                    resolve(data);
                }
            });
        });
    } catch (e) {
        return e;
    }
};

export const callFunctionToSendOtp = (phone,otp) => {
    //////// SEND OTP TO SMS ////////
    // const from = "Get Bet"
    // const to = `917017935899`
    // const text = 'Your otp to log in get bet app is '+otp;
    //
    // vonage.sms.send({to, from, text})
    //     .then(resp => { console.log('Message sent successfully'); console.log(resp); })
    //     .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    //////// SEND OTP TO SMS ////////
}

export async function storeNewSessionFileFromSessionStore(req, userSessionData) {
    if (userSessionData?.id) {
        req.session.userSessionData = userSessionData;

        // Ensure session data is stored as a JSON string
        const sessionData = JSON.stringify(req.session);
        const sessionId = req.session?.id || userSessionData.id; // Use session ID
        const expires = Math.floor(req.session?.cookie?.expires?.getTime() / 1000) || Math.floor(Date.now() / 1000) + 86400; // Default 1 day expiration if missing

        const insertQuery = `INSERT INTO sessions (session_id, data, expires) VALUES (?, ?, ?)
                             ON DUPLICATE KEY UPDATE data = VALUES(data), expires = VALUES(expires)`;

        try {
            await pool.query(insertQuery, [sessionId, sessionData, expires]);
        } catch (error) {
            console.error('Error inserting/updating session:', error);
        }
    }
}

export function _generateUniqueIdForBackend(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}


export function _getUserProfileTrimester(lastPeriodDate) {
    if (!lastPeriodDate) return null;

    const lmp = new Date(lastPeriodDate);
    if (isNaN(lmp.getTime())) return null; // invalid date

    const today = new Date();
    const diffTime = today - lmp;
    const weeksPregnant = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

    if (weeksPregnant >= 0 && weeksPregnant <= 12) return 1;
    if (weeksPregnant >= 13 && weeksPregnant <= 27) return 2;
    if (weeksPregnant >= 28) return 3;

    return null; // if date is in future or invalid
}

const toSqlDate = (d = new Date()) => {
    const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tz.toISOString().slice(0, 10); // 'YYYY-MM-DD'
};

// details can be an object; we’ll stringify for JSON column
export const _buildDailyTaskPayloads = ({ userId, task, progressPercent, details = {}, taskDate = toSqlDate() }) => {
    const detailsStr = JSON.stringify(details ?? {});

    const insertData = {
        alias: ["?","?","?","?","?"],
        column: ["user_id","task_date","task","progress_percent","details"],
        values: [userId, taskDate, task, progressPercent, detailsStr],
        tableName: "daily_task_progress",
    };

    const updateData = {
        column: "progress_percent = ?, details = ?, updated_at = NOW()",
        value: [progressPercent, detailsStr, userId, taskDate, task], // + where params at the end
        whereCondition: "user_id = ? AND task_date = ? AND task = ?",
        returnColumnName: "id",
        tableName: "daily_task_progress",
    };

    return { insertData, updateData };
};
