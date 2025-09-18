import pool from "./connection.js";
import {
    getUserByIdQuery,
    loginUserQuery,
} from "../queries/commonQuries.js";
import {_generateUniqueIdForBackend, insertCommonApiCall} from "./helpers/commonModelHelper.js";

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