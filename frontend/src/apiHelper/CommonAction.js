import Axios from 'axios';
import createSocketConnection from "../socket/socket";
const api = Axios.create({
    baseURL: 'https://garbhsarthi.com/api/common/',
    withCredentials:true
})

export const actionToConnectSocketServer = () => async () => {
    const socket = createSocketConnection();
    socket.on('connect', () => {
        console.log('Connected to socket server:', socket.id);
    });

    socket.on('message', (data) => {
        let websocketData = JSON.parse(data);
        console.log('websocketData',websocketData)
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });
}

export const actionToGenerateOtpForPhoneNumber = async (phoneNumber)=>{
    try {
        return await api.post(`actionToGenerateOtpForPhoneNumberApiCall`, {phone:phoneNumber});
    } catch (error) {
        console.log(error);
    }
}

export const actionToGenerateVerifyOtpAndLoginSignupUser = async (phoneNumber,otp)=>{
    try {
        const {data} = await api.post(`actionToVerifyOtpAndLoginSignupUserApiCall`, {phone:phoneNumber,otp:otp})
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const actionToLogoutUserSession = (setUserLogoutLoading) => {
    try {
        api.post(`actionToLogoutUserSessionApiCall`, {}).then(() => {
            if(setUserLogoutLoading){
                setUserLogoutLoading(false);
            }
            // dispatch({ type: USER_SIGNIN_SUCCESS, payload: {}});
        })
    } catch (error) {
        console.log('error',error)
    }
}
