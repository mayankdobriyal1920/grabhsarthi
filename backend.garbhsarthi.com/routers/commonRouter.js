import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mime from 'mime-types';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {OAuth2Client} from "google-auth-library";
import {
    actionToVerifyLoginUserOtpApiCall,
    actionToGetCurrentUserProfileDataApiCall,
    actionToInsertNewUserLoginData,
    actionToVerifyUserPhoneApiCall,
    actionToSaveUserProfileDataApiCall,
    actionToUpdateUserProfileDataApiCall,
    actionToGetCommunityAllPostDataApiCall,
    actionToGetCommunityPostById,
    actionToGetCommunityPostCommentDataByIdApiCall,
    actionToGetAppVideoLibraryDataByCategoryApiCall,
    actionToGetAllSubscriptionPlanDataApiCall,
    actionToGetAllSubscriptionPlanDataByPlanIdApiCall,
    actionToGetAllScheduledLiveClassApiCall,
    actionToSaveSelectedLiveClassDataDataApiCall,
    actionToGetSelectedScheduledLiveClassApiCall,
    actionToGetDailyTasksByUserIdApiCall,
    actionToUpsertDailyTaskProgressApiCall,
    actionToLoginTrainerUserProfileByEmailAndPasswordApiCall,
    actionToGetCurrentTrainerSessionDataApiCall,
    actionToGetAllScheduledLiveClassByTrainerId,
    actionToGetTrainerDataByTrainerIdApiCall,
    actionToGetUserDataByUserIdApiCall,
    actionToGetUserAuthIntegrationByUserIdApiCall,
    actionToInsertUserAuthIntegration,
    actionToCreateGoogleMeetUrlLinkApiCall, actionToGetUserSelectedLiveClassesByProfileIdApiCall
} from "../models/commonModel.js";
import {
    callFunctionToSendOtp,
    createNewSessionWithUserDataAndRole, deleteCommonApiCall,
    deleteOldSessionFileFromSessionStore, insertCommonApiCall, updateCommonApiCall
} from "../models/helpers/commonModelHelper.js";
import multer from 'multer';
import {userSocketIdsObject} from "../server.js";
import Razorpay from 'razorpay';
import crypto from "crypto";
import moment from "moment-timezone";

const commonRouter = express.Router();

const RAW_R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-041c5f7e95b946eb9bc038564493ba59.r2.dev";
const R2_PUBLIC_URL = RAW_R2_PUBLIC_URL.replace(/\/+$/, ""); // trim trailing slashes
const R2_BUCKET = process.env.R2_BUCKET_NAME || "garbhsarthistore";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// build public URL for an object key
const r2Url = (key) => `${R2_PUBLIC_URL}/${key.replace(/^\/+/, "")}`;

const storage = multer.memoryStorage();
const upload = multer({ storage });

const r2 = new S3Client({
    region: "auto", // required for R2 (acts globally)
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // your account's R2 endpoint
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

commonRouter.post(
    '/actionToGetCurrentUserSessionDataApiCall',
    expressAsyncHandler(async (req, res) => {
        const id = req?.session?.userSessionData?.id;
        if (!id) {
            return res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }

        // Fetch the latest profile
        const responseData = await actionToGetCurrentUserProfileDataApiCall(id);

        // Only save if changed
        await createNewSessionWithUserDataAndRole(req, responseData);

        return res.status(200).send({
            success: true,
            userData: responseData,
            message: 'Session data retrieved successfully',
        });
    })
);

commonRouter.post(
    '/actionToGetCurrentTrainerSessionDataApiCall',
    expressAsyncHandler(async (req, res) => {
        const id = req?.session?.userSessionData?.id;
        if (!id) {
            return res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }

        // Fetch the latest profile
        const responseData = await actionToGetCurrentTrainerSessionDataApiCall(id);

        // Only save if changed
        await createNewSessionWithUserDataAndRole(req, responseData);

        return res.status(200).send({
            success: true,
            userData: responseData,
            message: 'Session data retrieved successfully',
        });
    })
);


commonRouter.post(
    '/actionToGetCurrentUserProfileDataApiCall',
    expressAsyncHandler(async (req, res) => {
        // Check if the session exists and the user is logged in
        if (req?.session?.userSessionData?.id) {
            actionToGetCurrentUserProfileDataApiCall(req?.session?.userSessionData?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToUpsertDailyTaskProgressApiCall',
    expressAsyncHandler(async (req, res) => {
        // Check if the session exists and the user is logged in
        if (req?.session?.userSessionData?.id) {
            actionToUpsertDailyTaskProgressApiCall(req?.session?.userSessionData?.id,req?.body).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToSaveUserProfileDataApiCall',
    expressAsyncHandler(async (req, res) => {
        // Check if the session exists and the user is logged in
        if (req?.session?.userSessionData?.id) {
            actionToSaveUserProfileDataApiCall(req?.session?.userSessionData?.id,req.body).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToUpdateUserProfileDataApiCall',
    expressAsyncHandler(async (req, res) => {
        // Check if the session exists and the user is logged in
        if (req?.session?.userSessionData?.id) {
            actionToUpdateUserProfileDataApiCall(req?.session?.userSessionData?.id,req.body).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToLogoutUserSessionApiCall',
    expressAsyncHandler(async (req, res) => {
        // Check if the session exists and the user is logged in
        const oldSessionId = req?.session?.id;
        deleteOldSessionFileFromSessionStore(oldSessionId).then(() => {
            req?.session?.destroy();
            res.status(200).send({
                success: true,
                message: 'User logged out',
            });
        });
    })
);

/////////////////////////////////////////////////////////////////////////////////////
function extractKeyFromR2Url(url) {
    try {
        const u = new URL(url);
        // drop leading slash(es)
        let path = u.pathname.replace(/^\/+/, "");

        // Style A (public):        DATA_STORE_DIRECTORY/...
        // Style B (bucket in path): <bucket>/DATA_STORE_DIRECTORY/...
        if (path.startsWith(`${R2_BUCKET}/`)) {
            path = path.slice(R2_BUCKET.length + 1);
        }

        // decode in case names had spaces etc.
        return decodeURI(path);
    } catch {
        return null;
    }
}

async function deleteFromR2ByBucketUrl(bucketUrl) {
    const Key = extractKeyFromR2Url(bucketUrl);
    if (!Key) return;

    try {
        await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key }));
    } catch (err) {
        console.error("R2 delete error:", Key, err?.message || err);
    }
}

commonRouter.post(
    '/actionToDeleteCommunityPostDataApiCall',
    expressAsyncHandler(async (req, res) => {
        const post = req.body;

        if (!post?.id) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        // 1) delete row
        await deleteCommonApiCall({
            condition: "id = ?",
            tableName: "community_post",
            values: [post.id],
        });

        // 2) fanout to sockets
        Object.keys(userSocketIdsObject).forEach((key) => {
            if (userSocketIdsObject[key] && post?.id) {
                userSocketIdsObject[key].emit("message", {
                    data: post,
                    type: "DELETE_COMMUNITY_POST_DATA",
                });
            }
        });

        // 3) delete files from R2 (both are FULL bucket URLs now)
        await Promise.allSettled([
            deleteFromR2ByBucketUrl(post?.object_url),
            deleteFromR2ByBucketUrl(post?.poster_url),
        ]);

        return res.json({ success: true, message: 'Post and files deleted successfully.' });
    })
);


commonRouter.post(
    '/actionToGenerateOtpForEmailAddressApiCall',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:1,
        }
        const email = req.body.email;
        const color = req.body.color;
        const otp = Math.floor(100000 + Math.random() * 900000);
        // const otp = 654321;
        callFunctionToSendOtp(email,otp);
        actionToVerifyUserPhoneApiCall(email)
            .then((user) => {
                if(user?.id) {
                    let dataToSend = {
                        column: `otp = ?`,
                        value: [otp, user?.id],
                        whereCondition: `id = ?`,
                        returnColumnName: "id",
                        tableName: "app_user",
                    };
                    updateCommonApiCall(dataToSend).then(() => {
                        res.status(200).send(responseToSend);
                    });
                }else {
                    actionToInsertNewUserLoginData(email,otp,color).then(() => {
                        res.status(200).send(responseToSend);
                    })
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);


commonRouter.post(
    '/actionToVerifyOtpAndLoginSignupUserApiCall',
    expressAsyncHandler(async (req, res) => {
        const otp = req.body.otp;
        const email = req.body.email;
        actionToVerifyLoginUserOtpApiCall(email,otp)
            .then(user => {
                if(user?.id) {
                    createNewSessionWithUserDataAndRole(req, user).then(() => {
                        res.status(200).send({
                            success: 1,
                            userData: user,
                            message: 'Session data retrieved successfully',
                        });
                    })
                }else{
                    res.status(200).send({
                        success: 0,
                        error:'otp',
                        message: 'OTP is not correct'
                    });
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

commonRouter.post(
    '/actionToLoginTrainerUserProfileByEmailAndPasswordApiCall',
    expressAsyncHandler(async (req, res) => {
        const password = req.body.password;
        const email = req.body.email;
        actionToLoginTrainerUserProfileByEmailAndPasswordApiCall(email,password)
            .then(user => {
                if(user?.id) {
                    createNewSessionWithUserDataAndRole(req, user).then(() => {
                        res.status(200).send({
                            success: 1,
                            userData: user,
                            message: 'Session data retrieved successfully',
                        });
                    })
                }else{
                    res.status(200).send({
                        success: 0,
                        error:'password',
                        message: 'Password is not correct'
                    });
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

commonRouter.post(
    '/actionToGetCommunityAllPostDataApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetCommunityAllPostDataApiCall(req?.body,req?.session?.userSessionData?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToGetDailyTasksByUserIdApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetDailyTasksByUserIdApiCall(req?.session?.userSessionData?.id,req?.session?.userSessionData?.role).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToGetTrainerDataByTrainerIdApiCall',
    expressAsyncHandler(async (req, res) => {
        actionToGetTrainerDataByTrainerIdApiCall(req?.body?.id).then(responseData => {
            res.status(200).send(responseData);
        })
    })
);

commonRouter.post(
    '/actionToGetUserDataByUserIdApiCall',
    expressAsyncHandler(async (req, res) => {
        actionToGetUserDataByUserIdApiCall(req?.body?.id).then(responseData => {
            res.status(200).send(responseData);
        })
    })
);

commonRouter.post(
    '/actionToGetCommunityPostCommentDataByIdApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetCommunityPostCommentDataByIdApiCall(req?.body?.postId,req?.session?.userSessionData?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

commonRouter.post(
    '/actionToGetUserAuthIntegrationByUserIdApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetUserAuthIntegrationByUserIdApiCall(req?.session?.userSessionData?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);

function oAuthClient() {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://backend.garbhsarthi.com/common/actionToGetAuthCallbackApiCall"
    );
}

// Utility: base64url helpers (avoid + / =)
const toB64Url = (str) =>
    Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const fromB64Url = (str) =>
    Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");


commonRouter.post(
    "/actionToCreateGoogleMeetUrlLinkApiCall",
    expressAsyncHandler(async (req, res) => {
        const userId = req?.session?.userSessionData?.id;
        if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

        const result = await actionToCreateGoogleMeetUrlLinkApiCall(userId);

        if (result?.id) {
            return res.status(200).send(result);
        }

        const state = userId;

        const client = oAuthClient();
        const scopes = ["https://www.googleapis.com/auth/meetings.space.created"];

        const authUrl = client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            include_granted_scopes: true,
            scope: scopes,
            state
        });

        // Not integrated → tell FE where to navigate for full redirect flow
        return res.status(200).json({
            need_auth: true,
            redirect_url: authUrl
        });
    })
);

/**
 * GET /common/actionToGetAuthCallbackApiCall
 * - Redirect URI (set this exact URL in Google Cloud Console)
 * - Exchanges code, stores tokens, and redirects back to your app
 */
commonRouter.get(
    "/actionToGetAuthCallbackApiCall",
    expressAsyncHandler(async (req, res) => {
        try {
            // Handle error returned by Google (e.g., user canceled)
            if (req.query.error) {
                return res.redirect(302, `https://trainer.garbhsarthi.com/home/error-meeting`);
            }

            const code = req.query.code;
            const userId = Number(req.query.state);
            if (!userId) return res.status(401).send("Unauthorized");

            const client = oAuthClient();
            const { tokens } = await client.getToken(code);
            client.setCredentials(tokens);

            // Get token info to extract email & scopes
            // Note: getTokenInfo requires an access_token
            const tokenInfo = await client.getTokenInfo(tokens.access_token);
            const email = tokenInfo.email || null;

            // Persist integration
            await actionToInsertUserAuthIntegration(userId, {
                google_email: email,
                access_token: tokens.access_token || null,
                refresh_token: tokens.refresh_token || null, // May be null if Google didn’t issue (e.g., user re-consented recently)
                scope: Array.isArray(tokenInfo.scopes)
                    ? tokenInfo.scopes.join(" ")
                    : tokenInfo.scopes || null,
                token_expiry: tokens.expiry_date ? moment(tokens.expiry_date).toDate() : null
            });

            // Optionally, create today’s Meet links right away
            await actionToCreateGoogleMeetUrlLinkApiCall(userId);

            return res.redirect(302, `https://trainer.garbhsarthi.com/home/success-meeting`);
        } catch (e) {
            console.error("OAuth callback error:", e);
            return res.redirect(302, `https://trainer.garbhsarthi.com/home/error-meeting`);
        }
    })
);

commonRouter.post(
    '/actionToGetAllSubscriptionPlanDataApiCall',
    expressAsyncHandler(async (req, res) => {
        actionToGetAllSubscriptionPlanDataApiCall().then(responseData => {
            res.status(200).send(responseData);
        })
    })
);


commonRouter.post(
    '/actionToGetAllScheduledLiveClassByTrainerId',
    expressAsyncHandler(async (req, res) => {
        if(req?.session?.userSessionData?.id){
            actionToGetAllScheduledLiveClassByTrainerId(req?.session?.userSessionData?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        }else{
            res.status(200).send([]);
        }
    })
);

commonRouter.post(
    '/actionToSaveSelectedLiveClassDataDataApiCall',
    expressAsyncHandler(async (req, res) => {
        if(req?.session?.userSessionData?.active_subscription?.plan_type === 'PREMIUM'){
            actionToSaveSelectedLiveClassDataDataApiCall(req?.body?.selected_live_class_id_array,req?.session?.userSessionData?.id,req?.session?.userSessionData?.profile?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        }else{
            res.status(200).send({success:0});
        }
    })
);

commonRouter.post(
    '/actionToGetAllScheduledLiveClassApiCall',
    expressAsyncHandler(async (req, res) => {
        if(req?.session?.userSessionData?.active_subscription?.plan_type === 'PREMIUM'){
            actionToGetUserSelectedLiveClassesByProfileIdApiCall(req?.session?.userSessionData?.id,req?.session?.userSessionData?.profile?.id).then(responseData => {
                if(!responseData?.length){
                    actionToGetAllScheduledLiveClassApiCall(req?.session?.userSessionData?.role,req?.session?.userSessionData?.profile?.last_period_date).then(responseData => {
                        res.status(200).send(responseData);
                    })
                }else{
                    res.status(200).send(responseData);
                }
            })
        }else{
            res.status(200).send([]);
        }
    })
);

commonRouter.post(
    '/actionToGetAppVideoLibraryDataByCategoryApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetAppVideoLibraryDataByCategoryApiCall(req?.body?.category,req?.session?.userSessionData?.role,req?.session?.userSessionData?.profile?.last_period_date).then(responseData => {
                res.status(200).send(responseData);
            })
        } else {
            // If no session found, return unauthorized response
            res.status(200).send({
                success: false,
                message: 'No active session found. User is not logged in.',
            });
        }
    })
);


// Helper to upload file to R2
async function uploadToR2(folder, file) {
    const ext = mime.extension(file.mimetype) || "bin";
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const key = `${folder}/${uniqueName}`;

    await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Note: R2 ignores ACL for public-read; use bucket policy/Public Access in dashboard.
    }));

    return r2Url(key); // <-- public *.r2.dev URL (no bucket in path)
}


commonRouter.post(
    "/actionToPostNewCommunityPostDataApiCall",
    upload.fields([{ name: "attachment", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
    expressAsyncHandler(async (req, res) => {
        const { object_type, message } = req.body;
        const attachmentFile = req.files?.attachment?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        let object_url = "";
        let poster_url = "";

        if (attachmentFile) {
            object_url = await uploadToR2("DATA_STORE_DIRECTORY/community_posts", attachmentFile);
        }
        if (thumbnailFile) {
            poster_url = await uploadToR2("DATA_STORE_DIRECTORY/community_posts", thumbnailFile);
        }

        if (!object_type || (!object_url && !message)) {
            return res.status(400).json({ message: "All required fields are not provided." });
        }

        const insertData = {
            column: ["created_by", "object_type", "object_url", "poster_url", "message"],
            alias: ["?", "?", "?", "?", "?"],
            values: [
                req?.session?.userSessionData?.id,
                object_type,
                object_url,
                poster_url,
                message || ""
            ],
            tableName: "community_post",
        };

        insertCommonApiCall(insertData).then((responseData) => {
            const postId = responseData?.id ?? responseData?.insertId ?? responseData?.lastInsertId;
            actionToGetCommunityPostById(postId, req?.session?.userSessionData?.id).then((postData) => {
                Object.keys(userSocketIdsObject).forEach((key) => {
                    if (userSocketIdsObject[key] && postData?.id) {
                        userSocketIdsObject[key].emit("message", {
                            data: postData,
                            type: "INSERT_COMMUNITY_POST_DATA",
                        });
                    }
                });
            });
        });

        res.json({ message: "Post uploaded successfully", object_url, poster_url });
    })
);

commonRouter.post(
    "/actionToCreateSubscriptionOrderApiCall",
    expressAsyncHandler(async (req, res) => {
        try {
            const { subscription_plan_id } = req.body;
            const memberId = req?.session?.userSessionData?.id;

            if (!memberId) {
                return res.status(401).json({ success: false, message: "User not logged in" });
            }

            // ✅ Get Plan Data
            const subscriptionPlanData = await actionToGetAllSubscriptionPlanDataByPlanIdApiCall(subscription_plan_id);

            if (!subscriptionPlanData?.id) {
                return res.status(404).json({ success: false, message: "Subscription plan not found" });
            }

            let totalAmount = subscriptionPlanData.price;

            // ✅ Create Razorpay Order
            const order = await razorpayInstance.orders.create({
                amount: totalAmount * 100, // in paise
                currency: "INR",
                receipt: `membership_${Date.now()}`,
            });

            const end_date = moment().add(subscriptionPlanData?.duration_days,'days').format();
            const formattedEndDate = new Date(end_date).toISOString().split("T")[0];

            // ✅ Insert into Database
            await insertCommonApiCall({
                tableName: "user_subscriptions",
                column: [
                    "user_id",
                    "plan_id",
                    "total_amount",
                    "razorpay_order_id",
                    "end_date",
                    "payment_status",
                ],
                values: [memberId, subscription_plan_id, totalAmount, order.id, formattedEndDate, "Pending"],
                alias: Array(6).fill("?"), // ❗ should be 6 instead of 8
            });

            // ✅ Return Order Details to Frontend
            return res.json({
                success: true,
                order,
            });

        } catch (err) {
            console.error("Error creating membership order:", err);
            return res.status(500).json({ success: false, message: "Error creating membership order" });
        }
    })
);

commonRouter.post(
    '/actionToVerifySubscriptionOrderPaymentApiCall',
    expressAsyncHandler(async (req, res) => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const memberId = req?.session?.userSessionData?.id;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            // ✅ Generate signature
            const generated_signature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            const isValid = generated_signature === razorpay_signature;

            // ✅ Update in DB
            await updateCommonApiCall({
                tableName: 'user_subscriptions',
                column: [
                    'razorpay_payment_id=?',
                    'razorpay_signature=?',
                    'payment_status=?',
                    'updated_at=?',
                    'is_active=?',
                ].filter(Boolean),  // Remove null if failed
                value: [
                    razorpay_payment_id,
                    razorpay_signature,
                    isValid ? 'success' : 'failed',
                    new Date(),
                    1,
                    razorpay_order_id
                ].filter(Boolean),
                whereCondition: `razorpay_order_id = ?`
            });

            let dataToSend = {
                column: `is_active = ?`,
                value: [0, memberId,razorpay_order_id],
                whereCondition: `user_id = ? AND razorpay_order_id != ?`,
                returnColumnName: "id",
                tableName: "user_subscriptions",
            };

            await updateCommonApiCall(dataToSend);

            if (isValid) {
                return res.json({ success: true, message: '✅ Payment verified successfully' });
            } else {
                return res.status(400).json({ success: false, message: '❌ Payment verification failed' });
            }
        } catch (err) {
            console.error('Error verifying payment:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    })
);


export default commonRouter;