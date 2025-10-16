import pool from "./connection.js";
import {
    actionToGetAppVideoLibraryDataByCategoryQuery,
    actionToGetCommunityAllPostDataCountQuery,
    actionToGetCommunityAllPostDataQuery,
    actionToGetCommunityPostByIdQuery,
    actionToGetCommunityPostCommentDataByIdQuery, actionToGetDailyTasksByUserIdQuery, getUserByIdQuery,
    loginUserQuery,
} from "../queries/commonQuries.js";
import {
    _buildDailyTaskPayloads,
    _generateUniqueIdForBackend, _getUserProfileTrimester,
    deleteCommonApiCall,
    insertCommonApiCall,
    updateCommonApiCall
} from "./helpers/commonModelHelper.js";
import moment from "moment-timezone";
import {actionToCreateAndUpdateDailyMeetLinks} from "./MeetUrlModal.js";

export const actionToVerifyLoginUserOtpApiCall = (email,otp) => {
    return new Promise(function(resolve, reject) {
        let userData = {};
        const query = loginUserQuery();
        pool.query(query,[email,otp], (error, results) => {
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

export const actionToLoginTrainerUserProfileByEmailAndPasswordApiCall = (email,password) => {
    return new Promise(function(resolve, reject) {
        let userData = {};
        const query = `SELECT id,name,email FROM trainer WHERE email = ? AND password = ?`;
        pool.query(query,[email,password], (error, results) => {
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


export const actionToVerifyUserPhoneApiCall = (email) => {
    return new Promise(function(resolve, reject) {
        let userData = {};
        const query = `select id from app_user where email = ?`;
        pool.query(query,[email], (error, results) => {
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

export const actionToGetCurrentTrainerSessionDataApiCall = (userId) => {
    return new Promise(function (resolve, reject) {
        let userData = {};
        const query = `select id,email,name from trainer where id = ?`;

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

export const actionToUpsertDailyTaskProgressApiCall = async (userId,payload) => {
    try {
        // merge userId into payload so builder has everything
        const { insertData, updateData } = _buildDailyTaskPayloads({ ...payload, userId });

        // Try UPDATE first
        const updRes = await updateCommonApiCall(updateData);
        const updated = !!(updRes && (updRes.affectedRows > 0 || updRes.status === 1 || updRes.updated === true));
        if (updated) {
            return { status: 1, mode: "update" };
        }

        // Fallback: INSERT
        const insRes = await insertCommonApiCall(insertData);
        const inserted = !!(insRes && (insRes.insertId || insRes.status === 1 || insRes.created === true));
        if (inserted) {
            return { status: 1, mode: "insert" };
        }

        return { status: 0, error: "No rows updated or inserted" };
    } catch (err) {
        console.error("actionToUpsertDailyTaskProgressApiCall error:", err);
        return { status: 0, error: err?.message || "Unknown error" };
    }
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


export const actionToInsertNewUserLoginData = (email,otp,color) => {
    return new Promise(function (resolve) {
        const uid = _generateUniqueIdForBackend();
        let insertData = {
            alias: ["?","?","?","?"],
            column: ["uid","email","otp","color"],
            values: [uid, email,otp,color],
            tableName: "app_user",
        };

        insertCommonApiCall(insertData).then(() => {
            resolve({ status: 1 });
        });
    });
}



export const actionToGetCommunityAllPostDataApiCall = (body,userId) => {
    return new Promise(function (resolve, reject) {
        const { query: dataQuery, values: dataValues } = actionToGetCommunityAllPostDataQuery(body,userId);
        const { query: countQuery, values: countValues } = actionToGetCommunityAllPostDataCountQuery(body,userId);

        // Run both queries in parallel
        let resultData = [];
        let totalCount = 0;

        pool.query(dataQuery, dataValues, (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            resultData = dataResults;

            // Run count query only after data query completes
            pool.query(countQuery, countValues, (error, countResults) => {
                if (error) {
                    return reject(error);
                }
                if (countResults?.length) {
                    totalCount = countResults[0].total_count || 0;
                }

                // Send both data and count together
                resolve({
                    data: resultData,
                    totalCount
                });
            });
        });
    });
};



export const actionToGetCommunityPostCommentDataByIdApiCall = (postId) => {
    return new Promise(function (resolve, reject) {
        const query = actionToGetCommunityPostCommentDataByIdQuery();
        let resultData = [];
        pool.query(query, [postId], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults;
            }
            resolve(resultData);
        });
    });
};

export const actionToGetUserAuthIntegrationByUserIdApiCall = (userId) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT * FROM user_integration WHERE user_id = ?`
        let resultData = [];
        pool.query(query, [userId], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults[0];
            }
            resolve(resultData);
        });
    });
};

export const actionToCreateGoogleMeetUrlLinkApiCall = (userId) => {
    return new Promise(function (resolve) {
        actionToGetUserAuthIntegrationByUserIdApiCall(userId).then((integrationData)=>{
            if(integrationData?.id){
                actionToCreateAndUpdateDailyMeetLinks(userId,integrationData).then(()=>{
                    resolve(integrationData);
                })
            }else{
                resolve({});
            }
        })
    });
};

export async function actionToInsertUserAuthIntegration(userId, payload) {
    const params = {
        google_email: payload.google_email || null,
        access_token: payload.access_token || null,
        refresh_token: payload.refresh_token || null, // encrypt here if desired
        scope: payload.scope || null,
        token_expiry: payload.token_expiry
            ? moment(payload.token_expiry).format("YYYY-MM-DD HH:mm:ss")
            : null,
    };

    // We are NOT inserting created_at / updated_at; let MySQL defaults handle them.
    const insertData = {
        tableName: "user_integration",
        column: [
            "user_id",
            "provider",
            "google_email",
            "access_token",
            "refresh_token",
            "scope",
            "token_expiry",
        ],
        alias: ["?", "?", "?", "?", "?", "?", "?"], // must match columns length
        values: [
            userId,
            "google", // <- important
            params.google_email,
            params.access_token,
            params.refresh_token,
            params.scope,
            params.token_expiry,
        ],
    };

    return await insertCommonApiCall(insertData);
}



export const actionToGetTrainerDataByTrainerIdApiCall = (id) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT id,name FROM trainer WHERE id = ?`;
        let resultData = {};
        pool.query(query, [id], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults[0];
            }
            resolve(resultData);
        });
    });
};

export const actionToGetUserDataByUserIdApiCall = (id) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT id,full_name as name FROM profile WHERE id = ?`;
        let resultData = {};
        pool.query(query, [id], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults[0];
            }
            resolve(resultData);
        });
    });
};

export const actionToGetLiveClassDataByMeetingHashApiCall = (meeting_hash) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT id,title FROM live_classes WHERE meeting_hash = ?`;
        let resultData = {};
        pool.query(query, [meeting_hash], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults[0];
            }
            resolve(resultData);
        });
    });
};

export const actionToGetDailyTasksByUserIdApiCall = (userId,role) => {
    return new Promise(function (resolve, reject) {
        const query = actionToGetDailyTasksByUserIdQuery(role);
        let resultData = [];
        pool.query(query, [userId], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults;
            }
            resolve(resultData);
        });
    });
};

export const actionToGetAllSubscriptionPlanDataApiCall = () => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT * FROM subscription_plans ORDER BY created_at ASC`;
        let resultData = [];
        pool.query(query, [], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults;
            }
            resolve(resultData);
        });
    });
};

export const actionToGetUserSelectedLiveClassesByProfileIdApiCall = (user_id, profile_id) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT live_classes.* FROM selected_live_class 
                          INNER JOIN live_classes on selected_live_class.selected_live_class_id = live_classes.id
                         WHERE selected_live_class.created_by = ? AND selected_live_class.profile_id = ?`;
        let resultData = [];
        pool.query(query, [user_id,profile_id], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults;
            }
            resolve(resultData);
        });
    });
};

export const actionToSaveSelectedLiveClassDataDataApiCall = async (
    selected_live_class_id_array,
    user_id,
    profile_id
) => {
    if (!selected_live_class_id_array?.length) return false;
    // Prepare all insert promises
    const insertPromises = selected_live_class_id_array.map((selected_live_class_id) => {
        const insertData = {
            tableName: "selected_live_class",
            column: ["user_id", "selected_live_class_id", "profile_id"],
            alias: ["?", "?", "?"], // must match number of columns
            values: [user_id, selected_live_class_id, profile_id],
        };

        return insertCommonApiCall(insertData);
    });

    // Wait for all inserts to complete
    await Promise.all(insertPromises);

    return true;
};


export const actionToGetAllScheduledLiveClassApiCall = (role,lastPeriodDate) => {
    return new Promise(function (resolve, reject) {
        const trimester = _getUserProfileTrimester(lastPeriodDate);
        // Apply type filtering based on role
        const typeCondition = (role === 2)
            ? `live_classes.type IN ('Prenatal', 'Garbh') AND (live_classes.trimester = ${trimester} OR live_classes.trimester IS NULL)`
            : `live_classes.type IN ('Postnatal', 'TTC')`;

        const query = `
            SELECT live_classes.id, 
                   live_classes.title, 
                   live_classes.start_time, 
                   live_classes.instructor_name,
                   live_classes.trimester,
                   live_classes.type,
                   live_classes.description,
                  JSON_OBJECT(
                          'id', trainer.id,
                          'name', trainer.name
                  ) AS trainer
            FROM live_classes
                     JOIN trainer ON trainer.id = live_classes.trainer_id
            WHERE ${typeCondition}
            ORDER BY live_classes.created_at ASC
        `;

        pool.query(query, (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            resolve(dataResults || []);
        });
    });
};

export const actionToGetSelectedScheduledLiveClassApiCall = (selected_live_class_id) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT live_classes.*,
                              JSON_OBJECT(
                                      'id', trainer.id,
                                      'name', trainer.name
                              ) AS trainer
                                 FROM live_classes
                                 JOIN trainer ON trainer.id = live_classes.trainer_id
                                 WHERE live_classes.id = ?`;
        pool.query(query,[selected_live_class_id], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            resolve(dataResults || []);
        });
    });
};

export const actionToGetAllScheduledLiveClassByTrainerId = (trainerId) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT live_classes.*
                                 FROM live_classes
                                 WHERE trainer_id = ?`;
        pool.query(query,[trainerId], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            resolve(dataResults || []);
        });
    });
};

export const actionToGetAllScheduledLiveClassWithoutSubscriptionApiCall = (role) => {
    return new Promise(function (resolve, reject) {

        // Apply type filtering based on role
        const typeCondition = (role === 2)
            ? `type IN ('Prenatal', 'Garbh')`
            : `type IN ('Postnatal', 'TTC')`;

        const query = `
            SELECT live_classes.id, 
                   live_classes.title,
                   live_classes.start_time, 
                   live_classes.end_time, 
                   live_classes.instructor_name, 
                   live_classes.action_type, 
                   live_classes.status, 
                   live_classes.type
                   JSON_OBJECT(
                           'id', trainer.id,
                           'name', trainer.name
                   ) AS trainer
            FROM live_classes
            JOIN trainer ON trainer.id = live_classes.trainer_id
            WHERE ${typeCondition}
            ORDER BY created_at ASC
        `;

        pool.query(query, (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            resolve(dataResults || []);
        });
    });
};


export const actionToGetAllSubscriptionPlanDataByPlanIdApiCall = (planId) => {
    return new Promise(function (resolve, reject) {
        const query = `SELECT * FROM subscription_plans WHERE id = ?`;
        let resultData = [];
        pool.query(query, [planId], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults[0];
            }
            resolve(resultData);
        });
    });
};


export const actionToGetAppVideoLibraryDataByCategoryApiCall = (category,role,lastPeriodDate) => {
    return new Promise(function (resolve, reject) {
        const {query,values} = actionToGetAppVideoLibraryDataByCategoryQuery(category,role,_getUserProfileTrimester(lastPeriodDate));
        let resultData = [];
        pool.query(query, values, (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults;
            }
            resolve(resultData);
        });
    });
};

export const actionToGetCommunityPostById = (postId,userId) => {
    return new Promise(function (resolve, reject) {
        const query = actionToGetCommunityPostByIdQuery();
        let resultData = {};
        pool.query(query, [userId,postId], (error, dataResults) => {
            if (error) {
                return reject(error);
            }
            if(dataResults?.length){
                resultData = dataResults[0];
            }
            resolve(resultData);
        });
    });
};


export const actionToUpdateLikeDislikeData = async ({ postId, userId }) => {
    let liked = false;

    try {
        // Try to insert (like)
        await insertCommonApiCall({
            alias: ["?", "?"],
            column: ["post_id", "user_id"],
            values: [postId, userId],
            tableName: "community_post_like",
        });
        liked = true; // insert succeeded → now liked
    } catch (err) {
        // If duplicate key, toggle OFF by deleting
        const code = err?.code || err?.errno; // mysql gives code='ER_DUP_ENTRY', errno=1062
        if (code === "ER_DUP_ENTRY" || code === 1062) {
            await deleteCommonApiCall({
                condition: "post_id = ? AND user_id = ?",
                tableName: "community_post_like",
                values: [postId, userId],
            });
            liked = false; // after delete → not liked
        } else {
            // real error
            throw err;
        }
    }

    const q = (sql, params = []) =>
        new Promise((resolve, reject) => {
            pool.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
        });
    // fetch updated like count
    const rows = await q(
        "SELECT COUNT(id) AS total_count FROM community_post_like WHERE post_id = ?",
        [postId]
    );

    const like_count = rows[0]?.total_count ?? 0;

    return { liked, like_count };
};


export const actionToPostNewCommentInCommunityPostApiCall = async ({ post_id, user_id,message }) => {
    // Try to insert (like)
    const resData = await insertCommonApiCall({
        alias: ["?", "?", "?"],
        column: ["post_id", "user_id", "message"],
        values: [post_id, user_id,message],
        tableName: "community_post_comment",
    })
    return resData?.id ?? resData?.insertId ?? resData?.lastInsertId;
};

