import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mime from 'mime-types';
import { pipeline } from "stream";
import { promisify } from "util";
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
    actionToGetAllScheduledLiveClassWithoutSubscriptionApiCall,
    actionToSaveSelectedLiveClassDataDataApiCall,
    actionToGetSelectedScheduledLiveClassApiCall,
    actionToGetDailyTasksByUserIdApiCall,
    actionToUpsertDailyTaskProgressApiCall
} from "../models/commonModel.js";
import {
    callFunctionToSendOtp,
    createNewSessionWithUserDataAndRole,
    deleteOldSessionFileFromSessionStore, insertCommonApiCall, updateCommonApiCall
} from "../models/helpers/commonModelHelper.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {userSocketIdsObject} from "../server.js";
import Razorpay from 'razorpay';
import crypto from "crypto";
import moment from "moment-timezone";

const fsp = fs.promises;
const uploadPath = "/var/www/html/garbhsarthi/public/uploads/community";
const audioUploadPath = "/var/www/html/garbhsarthi/public/uploads/audio";
const yogaTaskUploadPath = "/var/www/html/garbhsarthi/public/uploads/yogatasksvids";
const commonRouter = express.Router();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

commonRouter.post(
    '/actionToGetCurrentUserSessionDataApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetCurrentUserProfileDataApiCall(req?.session?.userSessionData?.id).then(responseData => {
                createNewSessionWithUserDataAndRole(req, responseData).then(() => {
                    res.status(200).send({
                        success: true,
                        userData:responseData,
                        message: 'Session data retrieved successfully',
                    });
                })
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

commonRouter.post(
    '/actionToGenerateOtpForPhoneNumberApiCall',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:1,
        }
        const phone = req.body.phone;
        const color = req.body.color;
        //const otp = Math.floor(100000 + Math.random() * 900000);
        const otp = 123456;
        callFunctionToSendOtp(phone,otp);
        actionToVerifyUserPhoneApiCall(req.body.phone)
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
                    actionToInsertNewUserLoginData(phone,otp,color).then(() => {
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
        let responseToSend = {
            success:0,
        }
        const otp = req.body.otp;
        const phone = req.body.phone;
        actionToVerifyLoginUserOtpApiCall(phone,otp)
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
    '/actionToGetAllSubscriptionPlanDataApiCall',
    expressAsyncHandler(async (req, res) => {
        actionToGetAllSubscriptionPlanDataApiCall().then(responseData => {
            res.status(200).send(responseData);
        })
    })
);

commonRouter.post(
    '/actionToGetAllScheduledLiveClassApiCall',
    expressAsyncHandler(async (req, res) => {
        if(req?.session?.userSessionData?.active_subscription?.plan_type === 'PREMIUM'){
            if(req?.session?.userSessionData?.profile?.selected_live_class_id){
                actionToGetSelectedScheduledLiveClassApiCall(req?.session?.userSessionData?.profile?.selected_live_class_id).then(responseData => {
                    res.status(200).send(responseData);
                })
            }else{
                actionToGetAllScheduledLiveClassApiCall(req?.session?.userSessionData?.role,req?.session?.userSessionData?.profile?.last_period_date).then(responseData => {
                    res.status(200).send(responseData);
                })
            }
        }else{
            res.status(200).send([]);
        }
    })
);

commonRouter.post(
    '/actionToSaveSelectedLiveClassDataDataApiCall',
    expressAsyncHandler(async (req, res) => {
        if(req?.session?.userSessionData?.active_subscription?.plan_type === 'PREMIUM'){
            actionToSaveSelectedLiveClassDataDataApiCall(req?.body?.selected_live_class_id,req?.session?.userSessionData?.profile?.id).then(responseData => {
                res.status(200).send(responseData);
            })
        }else{
            res.status(200).send({success:0});
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


// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomNum = Math.floor(100 + Math.random() * 900);
        const ext = path.extname(file.originalname);
        const uniqueName = `${timestamp}${randomNum}${ext}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only image or video files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
const uploadFields = upload.fields([{ name: "attachment", maxCount: 1 },{ name: "thumbnail", maxCount: 1 }]);
commonRouter.post(
    "/actionToPostNewCommunityPostDataApiCall",
    uploadFields,
    expressAsyncHandler(async (req, res) => {
        const { object_type, message } = req.body;
        const attachmentFile = req.files?.attachment?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];c

        const object_url = attachmentFile
            ? object_type === "image"
                ? `https://garbhsarthi.com/api/common/actionToGetImageApiCall/${attachmentFile.filename}`
                : object_type === "video"
                    ? `https://garbhsarthi.com/api/common/actionToGetVideoApiCall/${attachmentFile.filename}`
                    : ""
            : "";

        const poster_url = thumbnailFile
            ? `https://garbhsarthi.com/api/common/actionToGetImageApiCall/${thumbnailFile.filename}`
            : "";

        if (!object_type || (!object_url && !message)) {
            return res.status(400).json({ message: "All required fields are not provided." });
        }

        const insertData = {
            column: ["created_by", "object_type", "object_url", "poster_url", "message"],
            alias: ["?", "?", "?", "?", "?"],
            values: [
                req?.session?.userSessionData?.id,
                object_type,
                object_url || "",
                poster_url || "",
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

        res.json({ message: "Post uploaded successfully" });
    })
);

// Serve Images
commonRouter.get("/actionToGetImageApiCall/:imageName", (req, res) => {
    const { imageName } = req.params;
    const filePath = path.join(uploadPath, imageName);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json({ message: "File not found" });
        const mimeType = mime.lookup(filePath);
        if (!mimeType) return res.status(400).json({ message: "Unsupported file type" });
        res.setHeader("Content-Type", mimeType);
        if (!mimeType.startsWith("image/")) res.setHeader("Content-Disposition", `attachment; filename="${imageName}"`);
        fs.createReadStream(filePath).pipe(res);
    });
});

commonRouter.get("/actionToGetYogaTasksGifAndImageApiCall/:imageName", (req, res) => {
    const { imageName } = req.params;
    const filePath = path.join(yogaTaskUploadPath, imageName);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json({ message: "File not found" });
        const mimeType = mime.lookup(filePath);
        if (!mimeType) return res.status(400).json({ message: "Unsupported file type" });
        res.setHeader("Content-Type", mimeType);
        if (!mimeType.startsWith("image/")) res.setHeader("Content-Disposition", `attachment; filename="${imageName}"`);
        fs.createReadStream(filePath).pipe(res);
    });
});

const pump = promisify(pipeline);
const DEFAULT_CHUNK = 1 << 20; // 1 MB
const ONE_YEAR = 31536000;     // strong cache (tweak if files change)

// ---- shared file streamer ----
async function streamFile({ req, res, baseDir, filename, fallbackType = "application/octet-stream" }) {
    const filePath = path.join(baseDir, filename);

    const stat = await fsp.stat(filePath).catch(() => null);
    if (!stat?.isFile()) {
        return res.status(404).json({ message: "File not found" });
    }

    const size = stat.size;
    const mimeType = mime.contentType(path.extname(filePath)) || fallbackType;

    // cache headers
    const lastModified = stat.mtime.toUTCString();
    const etag = `"${size}-${stat.mtime.getTime()}"`;
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", `public, max-age=${ONE_YEAR}, immutable`);
    res.setHeader("ETag", etag);
    res.setHeader("Last-Modified", lastModified);

    // conditional GET
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    if (req.headers["if-modified-since"] === lastModified) return res.status(304).end();

    const range = req.headers.range;

    // HEAD support (fast probe)
    if (req.method === "HEAD" && !range) {
        res.writeHead(200, { "Content-Type": mimeType, "Content-Length": size });
        return res.end();
    }

    // No range → send whole file
    if (!range) {
        res.writeHead(200, { "Content-Type": mimeType, "Content-Length": size });
        const stream = fs.createReadStream(filePath, { highWaterMark: DEFAULT_CHUNK });
        try { await pump(stream, res); } catch { res.destroy(); }
        return;
    }

    // bytes=start-end
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m) return res.status(416).set("Content-Range", `bytes */${size}`).end();

    let start = m[1] ? parseInt(m[1], 10) : 0;
    let end   = m[2] ? parseInt(m[2], 10) : Math.min(start + DEFAULT_CHUNK - 1, size - 1);

    // clamp/validate
    if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end < start || start >= size) {
        return res.status(416).set("Content-Range", `bytes */${size}`).end();
    }
    if (end >= size) end = size - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
    });

    const stream = fs.createReadStream(filePath, {
        start,
        end,
        highWaterMark: DEFAULT_CHUNK,
    });

    try { await pump(stream, res); } catch { res.destroy(); }
}

// ---------------- routes (both) ----------------

commonRouter.get("/actionToGetVideoApiCall/:videoName", async (req, res) => {
    try {
        await streamFile({
            req, res,
            baseDir: uploadPath,
            filename: req.params.videoName,
            fallbackType: "video/mp4",
        });
    } catch (e) {
        console.error("video stream error:", e);
        res.status(500).json({ message: "Internal error" });
    }
});

commonRouter.get("/actionToGetAudioStreamApiCall/:audioName", async (req, res) => {
    try {
        await streamFile({
            req, res,
            baseDir: audioUploadPath,
            filename: req.params.audioName,
            fallbackType: "audio/mpeg", // better default for audio
        });
    } catch (e) {
        console.error("audio stream error:", e);
        res.status(500).json({ message: "Internal error" });
    }
});


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