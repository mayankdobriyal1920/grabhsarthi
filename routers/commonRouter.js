import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
    actionToSendOtpApiCall,
    actionToVerifyLoginUserOtpApiCall,
    actionToGetCurrentUserProfileDataApiCall
} from "../models/commonModel.js";
import {
    callFunctionToSendOtp,
    createNewSessionWithUserDataAndRole,
    deleteOldSessionFileFromSessionStore
} from "../models/helpers/commonModelHelper.js";


const commonRouter = express.Router();
let storeUserPhoneOtbObj = {};

commonRouter.post(
    '/actionToSendOtpApiCall',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:0,
        }
        const phone = req.body.phone;
        actionToSendOtpApiCall(req.body)
            .then(user => {
                if(user?.id) {
                    responseToSend = {
                        success:0,
                        error:'phone',
                        message:'Mobile no already registered'
                    }
                    res.status(200).send(responseToSend);
                }else{
                   // const otp = Math.floor(1000 + Math.random() * 9000);
                    const otp = 1234;
                    console.log(otp);

                    callFunctionToSendOtp(phone,otp);

                    storeUserPhoneOtbObj[phone] = otp;
                    responseToSend = {
                        success:1,
                    }
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

commonRouter.post(
    '/actionToSendOtpForLoginApiCall',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:0,
        }
        const phone = req.body.phone;
        actionToSendOtpApiCall(req.body)
            .then(user => {
                if(!user?.id) {
                    responseToSend = {
                        success:0,
                        error:'phone',
                        message:'Mobile not registered'
                    }
                    res.status(200).send(responseToSend);
                }else{
                    //const otp = Math.floor(1000 + Math.random() * 9000);
                    const otp = 1234;
                    console.log(otp);

                    callFunctionToSendOtp(phone,otp);

                    storeUserPhoneOtbObj[phone] = otp;
                    responseToSend = {
                        success:1,
                    }
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

commonRouter.post(
    '/actionToVerifyLoginUserOtpApiCall',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:0,
        }
        const otp = req.body.otp;
        const phone = req.body.phone;
        actionToVerifyLoginUserOtpApiCall(req.body.phone)
            .then(user => {
                if(user?.id) {
                    if (Number(storeUserPhoneOtbObj[phone]) === Number(otp)) {
                        createNewSessionWithUserDataAndRole(req, user).then(() => {
                            res.status(200).send({
                                success: 1,
                                userData: user,
                                message: 'Session data retrieved successfully',
                            });
                        })
                }else {
                        responseToSend = {
                            success: 0,
                            error:'otp',
                            message: 'OTP is not correct'
                        }
                        res.status(200).send(responseToSend);
                    }
                }else {
                    responseToSend = {
                        success:0,
                        error:'phone',
                        message:'Mobile not registered'
                    }
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

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

export default commonRouter;