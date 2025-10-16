// import {Vonage} from "@vonage/server-sdk";
import pool from "../connection.js";
import {sendEmail} from "./mailerHelper.js";

const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (a[k] !== b[k]) return false;
    return true;
};

// promisified save
const saveSession = (req) => new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));

export const createNewSessionWithUserDataAndRole = async (req, userData) => {
    if (!req?.session) throw new Error('No session');

    const prev = req.session.userSessionData || {};
    const next = { ...prev, ...userData }; // don’t add timestamps unless changed

    if (shallowEqual(prev, next)) {
        // nothing changed: don’t save (avoids extra DB writes)
        return true;
    }

    req.session.userSessionData = next;
    await saveSession(req);
    return true;
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

/**
 * Send OTP via 2Factor.in
 * @param {string} email - E.164 or normal email (you may normalize)
 * @param {string|number} otp - The OTP code to send
 * @returns {Promise<object>} - The API response from 2Factor
 */
export async function callFunctionToSendOtp(email, otp) {
    if (!email) throw new Error("email is required");
    if (otp === undefined || otp === null || `${otp}`.trim() === "") {
        throw new Error("otp is required");
    }

    const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color:#f4f7fb; padding:40px 0; text-align:center;">
    <div style="background-color:#ffffff; max-width:420px; margin:auto; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:30px 25px;">
      <h2 style="color:#e55b7c; font-size:26px; margin-bottom:6px;">Garbh Sarthi</h2>
      <h2 style="color:#333333; font-size:20px; margin-bottom:10px;">Email Verification Code</h2>
      <p style="color:#555555; font-size:15px; line-height:22px; margin-bottom:25px;">
        Use the OTP below to verify your email address. This code will expire soon for security reasons.
      </p>

      <div style="font-size:28px; letter-spacing:6px; font-weight:600; color:#2b6cb0; background-color:#f0f5ff; display:inline-block; padding:12px 30px; border-radius:8px; margin-bottom:20px;">
        ${otp}
      </div>

      <p style="color:#888888; font-size:13px; margin-top:20px;">
        Didn’t request this? Please ignore this email.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">

      <p style="color:#777777; font-size:13px;">
        — The Garbhsarthi Team<br>
        <a href="https://garbhsarthi.com" style="color:#2b6cb0; text-decoration:none;">garbhsarthi.com</a>
      </p>
    </div>
  </div>
`;

    return await sendEmail({
        to: email,
        subject: "Garbhsarthi OTP Verification Code",
        html,
        headers: {
            "Auto-Submitted": "auto-generated",
            "X-Entity-Type": "transactional",
        },
    });
}


/**
 * Very simple email normalization (for India). Use a library for production.
 */
function normalizePhone(input) {
    let p = `${input}`.trim().replace(/[^\d+]/g, "");
    if (p.startsWith("+")) return p;
    // If it’s 10 digits, assume Indian
    if (/^\d{10}$/.test(p)) {
        return "91" + p;
    }
    return p;
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
