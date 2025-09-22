import Axios from 'axios';
import {createSocketConnection, sendSocketMessage} from "../socket/socket";
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
    createSocketConnection();
}

export const actionToInsertCommunityPostDataLocally = (postData) => {
    const {setCommunityAllPostData,communityAllPostData} = useStore.getState();
    let prevStateData = [...communityAllPostData.communityPost];
    prevStateData.unshift(postData);
    setCommunityAllPostData({
        communityPost: [...prevStateData],
        offset: communityAllPostData.offset,
        totalCount: communityAllPostData.totalCount || 0,
    });
}

export const actionToUpdateCommunityPostLikesDataLocally = (likeResponseData) => {
    const {setCommunityAllPostData,communityAllPostData} = useStore.getState();
    let prevStateData = [...communityAllPostData.communityPost];
    const { userAuthDetail } = useStore.getState();
    const {userInfo} = userAuthDetail;

    prevStateData?.forEach((postData,key)=>{
        if(postData?.id === likeResponseData?.postId){

            prevStateData[key].like_counts = likeResponseData?.total_counts?.like_count;
            if(userInfo?.id === likeResponseData?.userId){
                prevStateData[key].liked_by_you = likeResponseData?.total_counts?.liked;
            }
        }
    })

    setCommunityAllPostData({
        communityPost: [...prevStateData],
        offset: communityAllPostData.offset,
        totalCount: communityAllPostData.totalCount || 0,
    });
}

export const actionToInsertCommunityPostCommentDataLocally = (commentResponseData) => {
    const {setCommunityPostCommentData,communityPostCommentData,communityAllPostData,commonActionSheetPopupData} = useStore.getState();
    if(commonActionSheetPopupData.page === 'community-post' && commonActionSheetPopupData?.popupData?.id === commentResponseData?.post_id) {
        let commentPostData = [...communityPostCommentData.postCommentData];
        commentPostData.push(commentResponseData);
        setCommunityPostCommentData([...commentPostData]);
    }
    let prevStateData = [...communityAllPostData.communityPost];
    prevStateData?.forEach((postData,key)=>{
        if(postData?.id === commentResponseData?.post_id){
            prevStateData[key].comment_counts += 1;
        }
    })
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
        api.post(`actionToGetCommunityAllPostDataApiCall`, payload,{ withCredentials: true }).then((responseData) => {

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

export const actionToGetCommunityPostCommentDataById = (postId) => {
    const {requestCommunityPostCommentData,setCommunityPostCommentData} = useStore.getState();
    requestCommunityPostCommentData();

    try {
        api.post(`actionToGetCommunityPostCommentDataByIdApiCall`, {postId},{ withCredentials: true }).then((responseData) => {
            setCommunityPostCommentData([...responseData.data]);
        })
    } catch (error) {
        console.log('error',error)
    }
}


export const actionToPostNewCommentInCommunityPost = (payload) => {
    const { userAuthDetail } = useStore.getState();
    const {userInfo} = userAuthDetail;
    sendSocketMessage('INSERT_COMMENT_IN_COMMUNITY_POST', {
        ...payload, user_id: userInfo?.id, role: userInfo?.role, color: userInfo?.color,user_name:userInfo?.profile?.full_name
    });
}

export const actionToLikeDislikeCommunityPost = (postId) => {
    const { userAuthDetail } = useStore.getState();
    const {userInfo} = userAuthDetail;
    sendSocketMessage('LIKE_DISLIKE_COMMUNITY_POST',{postId,userId:userInfo?.id});
}
export const actionToPostNewCommunityPostData = (formData) => {
    const { setCommunityPostIsInUploadingMode } = useStore.getState();
    setCommunityPostIsInUploadingMode({ status: true, progress: 0 });
    try {
        api.post("actionToPostNewCommunityPostDataApiCall", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
                if (!evt.total) return;
                const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
                setCommunityPostIsInUploadingMode({ status: true, progress: pct });
            },
        }).then(()=>{
            setCommunityPostIsInUploadingMode({ status: false, progress: 100 });
        })
    } catch (error) {
        console.error("Upload failed", error);
        setCommunityPostIsInUploadingMode({ status: false, progress: 0 });
        throw error;
    }
};

export const actionToLogoutUserSession = (setUserLogoutLoading) => {
    setUserLogoutLoading(false);
    const {setUserAuthDetail} = useStore.getState();
    try {
        api.post(`actionToLogoutUserSessionApiCall`, {},{ withCredentials: true }).then(() => {
            setUserLogoutLoading(false);
            setUserAuthDetail({});
            actionToGetUserSessionData();
            window.location.reload();
        })
    } catch (error) {
        console.log('error',error)
    }
}
