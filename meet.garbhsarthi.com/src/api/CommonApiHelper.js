import Axios from "axios";

let prodUrl = `https://backend.garbhsarthi.com/`;

const api = Axios.create({
    baseURL: prodUrl,
    withCredentials:true
})

const actionToSendVideoChunkDataToServer = (payload)=>{
    api.post(`recording-video-chunks`,payload,{
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

const actionToGetIceServers = async ()=>{
    const {data} = await api.post(`turn-credentials`);
    return data.iceServers;
}

const actionToCheckRoomStatus = async (roomId)=>{
    const {data} = await api.post(`check-room-status`,{roomId});
    return data.success;
}

const actionToSendVideoChunkDataToServerFinishProcess = async (groupId,duration)=>{
    await api.post(`recording-video-finish`,{groupId,duration});
    window.location.href = "https://garbhsarthi.com";
}

const actionToCreateClassRoom = async (roomId,userId)=>{
    return await api.post(`create-room`,{roomId,userId});
}

const actionToGetTrainerDataByTrainerId = async (id)=>{
    return await api.post(`common/actionToGetTrainerDataByTrainerIdApiCall`,{id});
}

const actionToGetUserDataByUserId = async (id)=>{
    return await api.post(`common/actionToGetUserDataByUserIdApiCall`,{id});
}

export {actionToCheckRoomStatus,actionToGetTrainerDataByTrainerId,actionToGetUserDataByUserId,actionToSendVideoChunkDataToServer,actionToSendVideoChunkDataToServerFinishProcess,actionToCreateClassRoom,actionToGetIceServers}