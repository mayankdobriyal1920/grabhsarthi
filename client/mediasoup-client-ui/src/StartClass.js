// StartClass.jsx
import React from "react";
import { useParams } from "react-router-dom";
import VideoRoom from "./VideoRoom";

export default function StartClass() {
    const { roomId } = useParams();
    return (
        <div className="teacher-screen">
            <VideoRoom isTeacher={true} roomId={roomId || "main-classroom"} />
        </div>

    );
}
