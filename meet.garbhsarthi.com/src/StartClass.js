import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import VideoRoom from "./VideoRoom";
import {actionToGetTrainerDataByTrainerId} from "./api/CommonApiHelper";

export default function StartClass() {
    const { roomId ,userId} = useParams();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const callFunctionToGetUser = async ()=>{
            const { data } = await actionToGetTrainerDataByTrainerId(userId);
            setUserData(data);
        }
        callFunctionToGetUser(userId);
    }, [userId]);

    if(!userData?.id){
        return (
            <div className="load-ng-screen-main">
                Loading...
            </div>
        )
    }else{
        return (
            <div className="teacher-screen">
                <VideoRoom isTeacher={true} userName={userData?.name} roomId={roomId} />
            </div>
        );
    }
}
