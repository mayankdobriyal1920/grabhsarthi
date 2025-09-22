import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mime from 'mime-types';
import {
    actionToVerifyLoginUserOtpApiCall,
    actionToGetCurrentUserProfileDataApiCall,
    actionToInsertNewUserLoginData,
    actionToVerifyUserPhoneApiCall,
    actionToSaveUserProfileDataApiCall,
    actionToUpdateUserProfileDataApiCall,
    actionToGetCommunityAllPostDataApiCall,
    actionToGetCommunityPostById, actionToGetCommunityPostCommentDataByIdApiCall
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

const uploadPath = "/var/www/html/garbhsarthi/public/uploads/community";
const commonRouter = express.Router();

commonRouter.post(
    '/actionToGetCurrentUserSessionDataApiCall',
    expressAsyncHandler(async (req, res) => {
        if (req?.session?.userSessionData?.id) {
            actionToGetCurrentUserProfileDataApiCall(req?.session?.userSessionData?.id).then(responseData => {
                res.status(200).send({
                    success: true,
                    userData:responseData,
                    message: 'Session data retrieved successfully',
                });
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
const uploadFields = upload.fields([{ name: "attachment", maxCount: 1 }]);
commonRouter.post(
    "/actionToPostNewCommunityPostDataApiCall",
    uploadFields,
    expressAsyncHandler(async (req, res) => {
        const { object_type, message } = req.body;
        const attachmentFile = req.files?.attachment?.[0];


        const object_url = attachmentFile
            ? object_type === "image"
                ? `https://garbhsarthi.com/api/common/actionToGetImageApiCall/${attachmentFile.filename}`
                : object_type === "video"
                    ? `https://garbhsarthi.com/api/common/actionToGetVideoApiCall/${attachmentFile.filename}`
                    : ""
            : "";


        if (!object_type || (!object_url && !message)) {
            return res.status(400).json({ message: "All required fields are not provided." });
        }


        const insertData = {
            column: ["created_by", "object_type", "object_url", "message"],
            alias: ["?", "?", "?", "?"],
            values: [req?.session?.userSessionData?.id, object_type, object_url || "", message || ""],
            tableName: "community_post",
        };
        insertCommonApiCall(insertData).then((responseData)=>{
            // Try common names for the inserted id
            const postId = responseData?.id ?? responseData?.insertId ?? responseData?.lastInsertId;
            actionToGetCommunityPostById(postId,req?.session?.userSessionData?.id).then((postData) => {
                Object.keys(userSocketIdsObject).forEach((key) => {
                    if (userSocketIdsObject[key] && postData?.id) {
                        userSocketIdsObject[key].emit('message', {
                            data: postData, // Ensure userIdsArray exists
                            type: "INSERT_COMMUNITY_POST_DATA",
                        });
                    }
                });
            })
        })
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


// Serve Videos
commonRouter.get("/actionToGetVideoApiCall/:imageName", (req, res) => {
    const { imageName } = req.params;
    const filePath = path.join(uploadPath, imageName);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json({ message: "File not found" });
        const mimeType = mime.lookup(filePath);
        if (!mimeType) return res.status(400).json({ message: "Unsupported file type" });
        res.setHeader("Content-Type", mimeType);
        if (!mimeType.startsWith("video/")) res.setHeader("Content-Disposition", `attachment; filename="${imageName}"`);
        fs.createReadStream(filePath).pipe(res);
    });
});

export default commonRouter;