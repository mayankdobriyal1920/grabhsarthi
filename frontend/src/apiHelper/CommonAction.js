import Axios from 'axios';
import createSocketConnection from "../socket/socket";
import useStore from "../zustand/useStore";
import {_generateRandomPastelColor} from "./CommonHelper";
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

export const actionToConnectSocketServer = () => {
    const socket = createSocketConnection();
    socket.on('connect', () => {
        console.log('Connected to socket server:', socket.id);
    });

    socket.on('message', (data) => {
        let websocketData = JSON.parse(data);
        console.log('websocketData',websocketData)
        switch (websocketData?.type) {
            case 'INSERT_COMMUNITY_POST_DATA': {
                actionToInsertCommunityPostDataLocally(websocketData?.data);
                break;
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });
}

export const actionToInsertCommunityPostDataLocally = (postData) => {
    const {setCommunityAllPostData,communityAllPostData} = useStore.getState();
    let prevStateData = [...communityAllPostData.communityPost];
    prevStateData.unshift(postData);
    setCommunityAllPostData({
        communityPost: [...postData],
        offset: communityAllPostData.offset,
        totalCount: communityAllPostData.totalCount || 0,
    });
}

export const actionToGenerateOtpForPhoneNumber = async (phoneNumber)=>{
    try {
        return await api.post(`actionToGenerateOtpForPhoneNumberApiCall`, {phone:phoneNumber,color:_generateRandomPastelColor()},{ withCredentials: true });
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

export const actionToSetCommonActionSheetPopupData = (page = '',popupData = null) => {
    const {setCommonActionSheetPopupData} = useStore.getState();
    setCommonActionSheetPopupData({page,popupData});
}

export const actionToGetCommunityAllPostData = (isLoading = true,payload = {}) => {
    const {requestCommunityAllPostData,setCommunityAllPostData,communityAllPostData} = useStore.getState();


    let prevStateData = [...communityAllPostData.communityPost];
    if(isLoading){
        payload.offset = 0;
        prevStateData = [];
        requestCommunityAllPostData();
    }else{
        payload.offset = communityAllPostData.offset + 20;
    }
    payload.limit = 20;

    try {
        api.post(`actionToGetCommunityAllPostDataApiCall`, {},{ withCredentials: true }).then((responseData) => {

            let postData = responseData.data.data || [];
            postData = [...postData,...prevStateData]

            setCommunityAllPostData({
                communityPost: [...postData],
                offset: payload.offset,
                totalCount: responseData.data.totalCount || 0,
            });
        })
    } catch (error) {
        console.log('error',error)
    }
}

export const actionToPostNewCommunityPostData = (formData) => {
    console.log('formData',formData)
    const { setCommunityPostIsInUploadingMode } = useStore.getState();
    setCommunityPostIsInUploadingMode({ status: true, process: 0 });
    try {
        api.post("actionToPostNewCommunityPostDataApiCall", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
                if (!evt.total) return;
                const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
                setCommunityPostIsInUploadingMode({ status: true, process: pct });
            },
        }).then(()=>{
            setCommunityPostIsInUploadingMode({ status: false, process: 100 });
        })
    } catch (error) {
        console.error("Upload failed", error);
        setCommunityPostIsInUploadingMode({ status: false, process: 0 });
        throw error;
    }
};

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
