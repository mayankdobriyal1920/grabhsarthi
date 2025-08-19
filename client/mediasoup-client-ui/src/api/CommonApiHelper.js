import Axios from "axios";

let prodUrl = `https://garbhsarthi.com/api/`;

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
    window.location.href = "https://garbhsarthi.com/class/monika1212";
}

const actionToCreateClassRoom = async (secret)=>{
    return await api.post(`create-room`,{secret});
}

export {actionToCheckRoomStatus,actionToSendVideoChunkDataToServer,actionToSendVideoChunkDataToServerFinishProcess,actionToCreateClassRoom,actionToGetIceServers}