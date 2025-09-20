import Axios from 'axios';
import createSocketConnection from "../socket/socket";
import useStore from "../zustand/useStore";
const api = Axios.create({
    baseURL: 'https://garbhsarthi.com/api/common/',
    withCredentials:true
})

export const actionToGetUserSessionData = () => {
    const {startUserAuthDetail,setUserAuthDetail,startUserSession,setUserSession} = useStore.getState();
    startUserSession();
    startUserAuthDetail();
    try {
        api.post(`actionToGetCurrentUserSessionDataApiCall`, {},{ withCredentials: true }).then(responseData => {
            if(responseData?.data?.success){
                setUserAuthDetail({...responseData?.data.userData});
                setUserSession(1);
            }else{
                setUserSession(0);
                setUserAuthDetail({})
            }
        })
    } catch (error) {
        setUserSession(0);
        setUserAuthDetail({})
    }
}

export const actionToConnectSocketServer = async () => {
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
        return await api.post(`actionToGenerateOtpForPhoneNumberApiCall`, {phone:phoneNumber},{ withCredentials: true });
    } catch (error) {
        console.log(error);
    }
}

export const actionToGenerateVerifyOtpAndLoginSignupUser = async (phoneNumber,otp)=>{
    try {
        const {data} = await api.post(`actionToVerifyOtpAndLoginSignupUserApiCall`, {phone:phoneNumber,otp:otp},{ withCredentials: true })
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const actionToUpdateUserProfileData = async (payload) => {
    try {
        return await api.post(`actionToUpdateUserProfileDataApiCall`, payload,{ withCredentials: true })
    } catch (error) {
        console.log(error);
    }
}

export const actionToSaveUserProfileData = async (payload) => {
    try {
        return await api.post(`actionToSaveUserProfileDataApiCall`, payload,{ withCredentials: true })
    } catch (error) {
        console.log(error);
    }
}

export const actionToGetCurrentUserProfileData = () => {
    const {setUserAuthDetail} = useStore.getState();
    try {
        api.post(`actionToGetCurrentUserProfileDataApiCall`, {},{ withCredentials: true }).then(responseData => {
            setUserAuthDetail({...responseData?.data});
        })
    } catch (error) {
        setUserAuthDetail({})
    }
}

export const actionToLogoutUserSession = (setUserLogoutLoading) => {
    setUserLogoutLoading(false);
    const {setUserAuthDetail} = useStore.getState();
    try {
        api.post(`actionToLogoutUserSessionApiCall`, {}).then(() => {
            setUserLogoutLoading(false);
            setUserAuthDetail({});
        })
    } catch (error) {
        console.log('error',error)
    }
}
