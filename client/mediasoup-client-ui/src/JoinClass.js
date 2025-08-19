// JoinClass.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import VideoRoom from "./VideoRoom";
import {actionToCheckRoomStatus} from "./api/CommonApiHelper";

export default function JoinClass() {
    const { roomId } = useParams();
    const [joined, setJoined] = useState(false);
    const [userName, setUserName] = useState("");
    const [error, setError] = useState("");

    const handleJoin = async () => {
        if (!userName.trim()) {
            setError("Please enter your name before joining.");
            return;
        }

        try {
            // 👇 call your backend to check teacher status
            const success = await actionToCheckRoomStatus(roomId)

            if (!success) {
                alert("The teacher has not joined yet. Please wait.");
                return;
            }
            setError("");
            setJoined(true);
        } catch (err) {
            console.error("Error checking teacher status", err);
            alert("Unable to check room status. Please try again.");
        }
    };


    return (
        <div className="join-screen">
            {!joined ? (
                <div className="join-screen-button-con">
                    <div className="join-card">
                        <h1 className="join-title">Welcome to the Class</h1>
                        <p className="join-subtitle">
                            Get ready to join the live session. Please enter your name below to join the classroom.
                        </p>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="join-input"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        {error && <p className="error-msg">{error}</p>}

                        <button onClick={handleJoin} className="join-btn">
                            Join Class
                        </button>
                    </div>
                </div>
            ) : (
                <VideoRoom
                    isTeacher={false}
                    setJoined={setJoined}
                    roomId={roomId || "main-classroom"}
                    userName={userName}
                />
            )}
        </div>
    );
}
