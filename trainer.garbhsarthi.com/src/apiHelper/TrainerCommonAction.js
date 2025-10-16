import Axios from 'axios';
import useStore from "../trainerStore/trainerStore";
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
        api.post(`actionToGetCurrentTrainerSessionDataApiCall`, {}).then(responseData => {
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

export const actionToCreateGoogleMeetUrlLink = async (setCreating) => {
    try {
        setCreating?.(true);

        const res = await api.post("actionToCreateGoogleMeetUrlLinkApiCall", {});

        // Case 1: Already integrated → backend returns meeting data
        if (res.data?.id) {
            return res.data;
        }

        // Case 2: Need auth → do a top-level redirect (no popup)
        if (res.data?.need_auth && res.data?.redirect_url) {
            window.location.href = res.data.redirect_url;
            return;
        }

        throw new Error("Unexpected response from server");
    } catch (err) {
        console.error("CreateMeet error:", err);
        alert("Something went wrong creating the Google Meet link.");
    } finally {
        setCreating?.(false);
    }
};



export const actionToLoginTrainerUserProfileByPhoneAndPassword = async (email,password)=>{
    try {
        const {data} = await api.post(`actionToLoginTrainerUserProfileByEmailAndPasswordApiCall`, {email:email,password:password})
        return data;
    } catch (error) {
        console.log(error);
    }
}


export const actionToGetAllScheduledLiveClassByTrainerId = () => {
    const {requestAllScheduledLiveClassData,setAllScheduledLiveClassData} = useStore.getState();
    requestAllScheduledLiveClassData();

    try {
        api.post(`actionToGetAllScheduledLiveClassByTrainerId`,{}).then((responseData) => {
            setAllScheduledLiveClassData([...responseData.data]);
        })
    } catch (error) {
        console.log('error',error)
    }
}

export const actionToLogoutUserSession = () => {
    const {setUserAuthDetail} = useStore.getState();
    try {
        api.post(`actionToLogoutUserSessionApiCall`, {}).then(() => {
            setUserAuthDetail({});
            actionToGetUserSessionData(true);
            window.location.reload();
        })
    } catch (error) {
        console.log('error',error)
    }
}
