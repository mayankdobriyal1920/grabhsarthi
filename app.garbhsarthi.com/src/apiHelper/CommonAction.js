import Axios from 'axios';
import {createSocketConnection, sendSocketMessage} from "../socket/socket";
import useStore from "../zustand/useStore";
import {_generateRandomPastelColor} from "./CommonHelper";
const api = Axios.create({
    baseURL: 'https://backend.garbhsarthi.com/common/',
    withCredentials:true
})


export const actionToGetUserSessionData = (isLoading = false) => {
    const {startUserAuthDetail,setUserAuthDetail,startUserSession,setUserSession} = useStore.getState();
    if(isLoading) {
        startUserSession();
        startUserAuthDetail();
    }
    try {
        api.post(`actionToGetCurrentUserSessionDataApiCall`, {}).then(responseData => {
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

export const actionToDeleteCommunityPostDataLocally = (postData) => {
    const {setCommunityAllPostData,communityAllPostData} = useStore.getState();
    let prevStateData = [...communityAllPostData.communityPost];
    let findIndex = prevStateData?.findIndex((val)=>val?.id === postData?.id);
    if(findIndex >= 0) {
        prevStateData.splice(findIndex,1);
        setCommunityAllPostData({
            communityPost: [...prevStateData],
            offset: communityAllPostData.offset,
            totalCount: communityAllPostData.totalCount || 0,
        });
    }
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


export const actionToGenerateOtpForEmailAddress = async (email)=>{
    try {
        return await api.post(`actionToGenerateOtpForEmailAddressApiCall`, {email:email,color:_generateRandomPastelColor()});
    } catch (error) {
        console.log(error);
    }
}

export const actionToGenerateVerifyOtpAndLoginSignupUser = async (email,otp)=>{
    try {
        const {data} = await api.post(`actionToVerifyOtpAndLoginSignupUserApiCall`, {email:email,otp:otp})
        return data;
    } catch (error) {
        console.log(error);
    }
}

export const actionToUpdateUserProfileData = async (payload) => {
    try {
        return await api.post(`actionToUpdateUserProfileDataApiCall`, payload)
    } catch (error) {
        console.log(error);
    }
}

export const actionToSaveUserProfileData = async (payload) => {
    try {
        return await api.post(`actionToSaveUserProfileDataApiCall`, payload)
    } catch (error) {
        console.log(error);
    }
}

export const actionToGetCurrentUserProfileData = () => {
    const {setUserAuthDetail} = useStore.getState();
    try {
        api.post(`actionToGetCurrentUserProfileDataApiCall`, {}).then(responseData => {
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
        payload.offset = communityAllPostData.offset + 5;
    }
    payload.limit = 5;

    try {
        api.post(`actionToGetCommunityAllPostDataApiCall`, payload).then((responseData) => {

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
        api.post(`actionToGetCommunityPostCommentDataByIdApiCall`, {postId}).then((responseData) => {
            setCommunityPostCommentData([...responseData.data]);
        })
    } catch (error) {
        console.log('error',error)
    }
}

export const actionToGetAllSubscriptionPlanData = () => {
    const {requestAllSubscriptionPlanData,setAllSubscriptionPlanData} = useStore.getState();
    requestAllSubscriptionPlanData();

    try {
        api.post(`actionToGetAllSubscriptionPlanDataApiCall`).then((responseData) => {
            setAllSubscriptionPlanData([...responseData.data]);
        })
    } catch (error) {
        console.log('error',error)
    }
}

export const actionToGetAppVideoLibraryDataByCategory = (category) => {
    const {requestAppVideoLibraryDataByCategory,setAppVideoLibraryDataByCategory} = useStore.getState();
    requestAppVideoLibraryDataByCategory();

    try {
        api.post(`actionToGetAppVideoLibraryDataByCategoryApiCall`, {category}).then((responseData) => {
            setAppVideoLibraryDataByCategory([...responseData.data]);
        })
    } catch (error) {
        console.log('error',error)
    }
}


export const actionToUpsertDailyTaskProgress = async (payload) => {
    api.post(`actionToUpsertDailyTaskProgressApiCall`, payload);
};

export const actionToGetDailyTasksByUserId = () => {
    const { requestDailyTasksToday, setDailyTasksToday, setDailyTasksTodayError } = useStore.getState();
    requestDailyTasksToday();

    try {
        api
            .post('actionToGetDailyTasksByUserIdApiCall', {})
            .then((response) => {
                const rows = Array.isArray(response?.data) ? response.data : [];

                // ✅ Build object keyed by task
                const tasksObj = rows.reduce((acc, r) => {
                    acc[r.task] = r; // keep full row under the task key
                    return acc;
                }, {});

                // ✅ Compute overall percent from rows
                const total = rows.reduce((acc, r) => acc + (Number(r.progress_percent) || 0), 0);
                const overallPercent = rows.length ? Math.round(total / rows.length) : 0;

                const date = rows[0]?.task_date ?? null;

                setDailyTasksToday({ data: tasksObj, overallPercent, date });
            });
    } catch (error) {
        console.error('actionToGetDailyTasksByUserId error:', error);
        setDailyTasksTodayError(error?.message);
    }
};


export const actionToGetAllScheduledLiveClass = () => {
    const {requestAllScheduledLiveClassData,setAllScheduledLiveClassData} = useStore.getState();
    requestAllScheduledLiveClassData();

    try {
        api.post(`actionToGetAllScheduledLiveClassApiCall`,{}).then((responseData) => {
            setAllScheduledLiveClassData([...responseData.data]);
        })
    } catch (error) {
        console.log('error',error)
    }
}

export const actionToSaveSelectedLiveClassDataData = (selected_live_class_id_array) => {
    const {requestAllScheduledLiveClassData} = useStore.getState();
    requestAllScheduledLiveClassData();
    try {
        api.post(`actionToSaveSelectedLiveClassDataDataApiCall`,{selected_live_class_id_array}).then(() => {
            actionToGetUserSessionData(false);
            setTimeout(()=>{
                actionToGetAllScheduledLiveClass();
            },3000)
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
        api.post(`actionToLogoutUserSessionApiCall`, {}).then(() => {
            setUserLogoutLoading(false);
            setUserAuthDetail({});
            actionToGetUserSessionData(true);
            window.location.reload();
        })
    } catch (error) {
        console.log('error',error)
    }
}

export const actionToDeleteCommunityPostData = async (post) => {
    try {
        await api.post(`actionToDeleteCommunityPostDataApiCall`, post);
    } catch (error) {
        console.log('error',error)
    }
}


export const actionToCreateSubscriptionOrder = async (payload) => {
    return await api.post(
        `actionToCreateSubscriptionOrderApiCall`,
        payload
    );
};

export const actionToVerifySubscriptionOrderPayment = async (razorpayData) => {
    return await api.post(
        `actionToVerifySubscriptionOrderPaymentApiCall`,
        {
            razorpay_order_id: razorpayData.razorpay_order_id,
            razorpay_payment_id: razorpayData.razorpay_payment_id,
            razorpay_signature: razorpayData.razorpay_signature
        }
    );
};