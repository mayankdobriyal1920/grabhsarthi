import pool from "./connection.js";
import {
    getUserByIdQuery,
    loginUserQuery,
} from "../queries/commonQuries.js";
import {_generateUniqueIdForBackend, insertCommonApiCall, updateCommonApiCall} from "./helpers/commonModelHelper.js";

export const actionToVerifyLoginUserOtpApiCall = (phone,otp) => {
    return new Promise(function(resolve, reject) {
        let userData = {};
        const query = loginUserQuery();
        pool.query(query,[phone,otp], (error, results) => {
            if (error) {
                reject(error)
            }
            if(results?.length){
                userData = results[0];
            }
            resolve(userData);
        })
    })
}

export const actionToVerifyUserPhoneApiCall = (phone) => {
    return new Promise(function(resolve, reject) {
        let userData = {};
        const query = `select id from app_user where phone = ?`;
        pool.query(query,[phone], (error, results) => {
            if (error) {
                reject(error)
            }
            if(results?.length){
                userData = results[0];
            }
            resolve(userData);
        })
    })
}

export const actionToGetCurrentUserProfileDataApiCall = (userId) => {
    return new Promise(function (resolve, reject) {
        let userData = {};
        const query = getUserByIdQuery();

        pool.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
            }

            if (results?.length) {
                userData = results[0];
            }

            resolve(userData);
        });
    });
}

export const actionToGetUserProfileDataByUserAndRole = (userId,role) => {
    return new Promise(function (resolve, reject) {
        let profileData = {};
        const query = `select id from profile where user_id = ? AND role = ?`;

        pool.query(query, [userId,role], (error, results) => {
            if (error) {
                reject(error);
            }

            if (results?.length) {
                profileData = results[0];
            }

            resolve(profileData);
        });
    });
}



/**
 * Save a user's profile in `profile` and then update `app_user` with role + active_profile_id.
 * Assumes you want to CREATE a new profile row each time (no upsert).
 * @param {number} userId - app_user.id (FK)
 * @param {object} payload - keys must match `profile` columns
 * @returns {Promise<boolean>}
 */
export const actionToSaveUserProfileDataApiCall = (userId, payload) => {
    return new Promise((resolve, reject) => {
        try {
            if (!userId) return reject(new Error("userId is required"));
            if (!payload || typeof payload !== "object") {
                return reject(new Error("payload must be an object"));
            }

            // Normalize payload to match DB expectations
            const normalized = payload;

            // Build INSERT parts
            const columns = Object.keys(normalized);
            const values = Object.values(normalized);

            // Append FK user_id
            columns.push("user_id");
            values.push(userId);

            // Create placeholders (?, ?, ?...)
            const placeholders = columns.map(() => "?");

            const insertData = {
                // For INSERT, `column` should be plain column names (not "col = ?")
                column: columns.join(", "),
                // Some wrappers expect "alias" to be placeholders for VALUES
                alias: placeholders,
                values,
                tableName: "profile",
            };

            insertCommonApiCall(insertData)
                .then((res) => {

                    // Try common names for the inserted id
                    const profileId = res?.id ?? res?.insertId ?? res?.lastInsertId;

                    if (!profileId) {
                        throw new Error("Could not determine inserted profile id from response");
                    }

                    const updateUser = {
                        column: "role = ? , active_profile_id = ?",
                        value: [normalized.role ?? null, profileId, userId], // matches "id = ?" below
                        whereCondition: "id = ?",
                        returnColumnName: "id",
                        tableName: "app_user",
                    };

                    return updateCommonApiCall(updateUser);
                })
                .then(() => resolve(true))
                .catch((err) => {
                    console.error("Failed to save profile:", err);
                    reject(err);
                });
        } catch (err) {
            reject(err);
        }
    });
};
// Update (or create) a user's profile, and sync app_user.role/active_profile_id
export const actionToUpdateUserProfileDataApiCall = (userId, payload = {}) => {
    return new Promise((resolve, reject) => {
        if (!userId) return reject(new Error("Missing userId"));

        // Whitelist columns that exist on `profile` table
        const allowedCols = new Set([
            "role",              // tinyint (2 = Pregnant Mom, 3 = TTC)
            "full_name",         // varchar(150)
            "due_date",          // date
            "father_name",       // varchar(150)
            "first_pregnancy",   // tinyint(1)
            "last_period_date",  // date
            "cycle_length",      // tinyint
            "period_length",     // tinyint (only if you added this column)
        ]);

        // Normalize payload -> SQL-friendly (undefined -> null, booleans -> tinyint)
        const sanitized = {};
        for (const [k, v] of Object.entries(payload || {})) {
            if (!allowedCols.has(k)) continue;

            if (k === "first_pregnancy") {
                sanitized[k] = v === null || v === undefined ? null : (v ? 1 : 0);
            } else if (typeof v === "string") {
                const trimmed = v.trim();
                sanitized[k] = trimmed === "" ? null : trimmed;
            } else if (v === undefined) {
                sanitized[k] = null;
            } else {
                sanitized[k] = v;
            }
        }

        // If nothing to update, short-circuit (still ensure user role/active_profile_id set if needed)
        const hasUpdatable = Object.keys(sanitized).length > 0;

        actionToGetUserProfileDataByUserAndRole(userId, payload?.role)
            .then((profileData) => {
                // If profile exists -> UPDATE
                if (profileData?.id) {
                    if (!hasUpdatable) {
                        // Still keep app_user in sync if role passed
                        const roleForUser = payload?.role ?? null;
                        if (roleForUser !== null) {
                            const updateUser = {
                                column: "role = ?, active_profile_id = ?",
                                value: [roleForUser, profileData.id, userId],
                                whereCondition: "id = ?",
                                returnColumnName: "id",
                                tableName: "app_user",
                            };
                            return updateCommonApiCall(updateUser)
                                .then(() => resolve({ status: 1, profile_id: profileData.id }));
                        }
                        return resolve({ status: 1, profile_id: profileData.id });
                    }

                    // Build dynamic SET clause for profile
                    const cols = Object.keys(sanitized);
                    const setClause = cols.map((c) => `${c} = ?`).join(", ");
                    const values = cols.map((c) => sanitized[c]);

                    const updateProfile = {
                        column: setClause,
                        value: [...values, profileData.id], // matches WHERE id = ?
                        whereCondition: "id = ?",
                        returnColumnName: "id",
                        tableName: "profile",
                    };

                    return updateCommonApiCall(updateProfile)
                        .then(() => {
                            // Sync app_user.role + active_profile_id (if role provided)
                            const roleForUser = sanitized.role ?? payload?.role ?? null;
                            if (roleForUser === null) {
                                // only ensure active_profile_id is aligned
                                const updateUser = {
                                    column: "active_profile_id = ?",
                                    value: [profileData.id, userId],
                                    whereCondition: "id = ?",
                                    returnColumnName: "id",
                                    tableName: "app_user",
                                };
                                return updateCommonApiCall(updateUser);
                            }

                            const updateUser = {
                                column: "role = ?, active_profile_id = ?",
                                value: [roleForUser, profileData.id, userId],
                                whereCondition: "id = ?",
                                returnColumnName: "id",
                                tableName: "app_user",
                            };
                            return updateCommonApiCall(updateUser);
                        })
                        .then(() => resolve({ status: 1, profile_id: profileData.id }));
                }

                // No profile -> CREATE (helper already sets app_user.role/active_profile_id)
                return actionToSaveUserProfileDataApiCall(userId, {
                    ...sanitized,
                    role: payload?.role ?? sanitized.role, // ensure role present for new profile
                }).then((res) => resolve({ status: 1, created: true, res }));
            })
            .catch((err) => {
                console.error("Profile update failed:", err);
                reject(err);
            });
    });
};


export const actionToInsertNewUserLoginData = (phone,otp) => {
    return new Promise(function (resolve) {
        const uid = _generateUniqueIdForBackend();
        let insertData = {
            alias: ["?","?","?"],
            column: ["uid","phone","otp"],
            values: [uid, phone,otp],
            tableName: "app_user",
        };

        insertCommonApiCall(insertData).then(() => {
            resolve({ status: 1 });
        });
    });
}