import React, { useState } from "react";
import { actionToCreateClassRoom } from "./api/CommonApiHelper";
import {useParams} from "react-router-dom";

export default function TeacherDashboard() {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(false);
    const {secret} = useParams();

    const createRoom = async () => {
        setLoading(true);
        if(!secret){
            alert('Secret required!');
            return false;
        }
        try {
            const { data } = await actionToCreateClassRoom(secret);
            setRoomData(data);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        const toast = document.createElement("div");
        toast.className = "gs-toast";
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("✅ Link copied to clipboard!");
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">👩‍🏫 GarbhSarthi Teacher Dashboard</h1>

            {!roomData ? (
                <div className="dashboard-actions">
                    <button
                        onClick={createRoom}
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? "⏳ Creating Room..." : "✨ Create New Class"}
                    </button>
                    <p className="info-text">Click to start a new live session</p>
                </div>
            ) : (
                <div className="room-info">
                    <div className="info-card">
                        <p className="label">📌 Room ID</p>
                        <p className="value">{roomData.roomId}</p>
                    </div>

                    <div className="info-card">
                        <p className="label">🎥 Start URL</p>
                        <a
                            href={roomData.startUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                        >
                            {roomData.startUrl}
                        </a>
                    </div>

                    <div className="info-card">
                        <p className="label">👩‍🎓 Join URL</p>
                        <div className="join-link-row">
                            <a
                                href={roomData.joinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                            >
                                {roomData.joinUrl}
                            </a>
                            <button
                                onClick={() => copyToClipboard(roomData.joinUrl)}
                                className="btn-secondary"
                            >
                                📋 Copy
                            </button>
                        </div>
                    </div>

                    <div className="start-class-container">
                        <button
                            onClick={() => window.open(roomData.startUrl, "_blank")}
                            className="btn-start"
                        >
                            🚀 Start Class
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
