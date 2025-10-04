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

export const actionToLoginTrainerUserProfileByPhoneAndPassword = async (phoneNumber,password)=>{
    try {
        const {data} = await api.post(`actionToLoginTrainerUserProfileByPhoneAndPasswordApiCall`, {phone:phoneNumber,password:password})
        console.log('data',data);
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
