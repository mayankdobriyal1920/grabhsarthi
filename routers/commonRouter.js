import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
    actionToVerifyLoginUserOtpApiCall,
    actionToGetCurrentUserProfileDataApiCall, actionToInsertNewUserLoginData, actionToVerifyUserPhoneApiCall
} from "../models/commonModel.js";
import {
    callFunctionToSendOtp,
    createNewSessionWithUserDataAndRole,
    deleteOldSessionFileFromSessionStore, updateCommonApiCall
} from "../models/helpers/commonModelHelper.js";


const commonRouter = express.Router();
let storeUserPhoneOtbObj = {};

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
        //const otp = Math.floor(1000 + Math.random() * 9000);
        const otp = 1234;
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
                    actionToInsertNewUserLoginData(phone,otp).then(() => {
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

export default commonRouter;