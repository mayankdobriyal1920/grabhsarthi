import React, { useState } from "react";
import { actionToCreateClassRoom } from "./api/CommonApiHelper";
import { useParams } from "react-router-dom";

export default function CreateMeetingDashboard() {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const { roomId, userId } = useParams();

    const createRoom = async () => {
        setErrMsg("");
        setLoading(true);
        try {
            // Backend now supports dynamic roomId. Pass whatever we have (may be undefined).
            const { data } = await actionToCreateClassRoom(roomId, userId);
            setRoomData(data);
        } catch (err) {
            // Try to pull a meaningful server message; fall back to generic.
            const message =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong while creating the room.";
            setErrMsg(message);
        } finally {
            setLoading(false);
        }
    };

    const openStartUrl = () => {
        if (roomData?.startUrl) window.open(roomData.startUrl, "_blank", "noopener,noreferrer");
    };

    const copyStartUrl = async () => {
        if (!roomData?.startUrl) return;
        try {
            await navigator.clipboard.writeText(roomData.startUrl);
            alert("Start URL copied!");
        } catch {
            // Fallback
            const ta = document.createElement("textarea");
            ta.value = roomData.startUrl;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            alert("Start URL copied!");
        }
    };

    // Derive display fields safely (defensive for different API shapes)
    const classTitle =
        roomData?.classData?.title ||
        roomData?.classData?.name ||
        roomData?.classData?.class_title ||
        "—";
    const trainerName =
        roomData?.userData?.name ||
        roomData?.userData?.full_name ||
        roomData?.userData?.fullName ||
        "—";
    const finalRoomId = roomData?.roomId || roomId || "—";

    return (
        <div className="dashboard-container" style={{ maxWidth: 780, margin: "0 auto", padding: 24 }}>
            <h1 className="dashboard-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
                GarbhSarthi Meeting Dashboard
            </h1>

            {/* error banner */}
            {errMsg ? (
                <div
                    role="alert"
                    style={{
                        background: "#fee2e2",
                        border: "1px solid #fecaca",
                        color: "#991b1b",
                        padding: "12px 14px",
                        borderRadius: 8,
                        marginBottom: 16
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Unable to create room</div>
                    <div style={{ fontSize: 14 }}>{errMsg}</div>
                </div>
            ) : null}

            {!roomData ? (
                <div className="dashboard-actions" style={{ display: "grid", gap: 12 }}>
                    <button
                        onClick={createRoom}
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: 0,
                            background: loading ? "#94a3b8" : "#2563eb",
                            color: "white",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: 600
                        }}
                    >
                        {loading ? "⏳ Creating room..." : "✨ Create New Class"}
                    </button>
                    <p className="info-text" style={{ color: "#475569", fontSize: 14 }}>
                        Click to start a new live session{userId ? ` for user ${userId}` : ""}.
                    </p>
                </div>
            ) : (
                <div className="room-info" style={{ display: "grid", gap: 16 }}>
                    {/* Class Title */}
                    <div
                        className="info-card"
                        style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}
                    >
                        <p className="label" style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                            📝 Class Title
                        </p>
                        <p className="value" style={{ margin: "6px 0 0 0", fontWeight: 600 }}>
                            {classTitle}
                        </p>
                    </div>

                    {/* Trainer Name */}
                    <div
                        className="info-card"
                        style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}
                    >
                        <p className="label" style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                            👩‍🏫 Trainer Name
                        </p>
                        <p className="value" style={{ margin: "6px 0 0 0", fontWeight: 600 }}>{trainerName}</p>
                    </div>

                    {/* Room ID */}
                    <div
                        className="info-card"
                        style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}
                    >
                        <p className="label" style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                            📌 Room ID
                        </p>
                        <p className="value" style={{ margin: "6px 0 0 0", fontWeight: 600 }}>{finalRoomId}</p>
                    </div>

                    {/* Start URL */}
                    <div
                        className="info-card"
                        style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}
                    >
                        <p className="label" style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                            🎥 Start URL
                        </p>
                        {roomData?.startUrl ? (
                            <div
                                className="join-link-row"
                                style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}
                            >
                                <a
                                    href={roomData.startUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link"
                                    style={{ wordBreak: "break-all", color: "#2563eb" }}
                                >
                                    {roomData.startUrl}
                                </a>
                                <button
                                    onClick={copyStartUrl}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid #cbd5e1",
                                        background: "white",
                                        cursor: "pointer",
                                        fontSize: 12
                                    }}
                                    title="Copy start URL"
                                >
                                    Copy
                                </button>
                            </div>
                        ) : (
                            <p className="value" style={{ margin: "6px 0 0 0" }}>—</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div
                        className="start-class-container"
                        style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                        <button
                            onClick={openStartUrl}
                            className="btn-start"
                            style={{
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: 0,
                                background: "#16a34a",
                                color: "white",
                                fontWeight: 600,
                                cursor: roomData?.startUrl ? "pointer" : "not-allowed",
                                opacity: roomData?.startUrl ? 1 : 0.6
                            }}
                            disabled={!roomData?.startUrl}
                        >
                            🚀 Start Class
                        </button>

                        <button
                            onClick={createRoom}
                            disabled={loading}
                            style={{
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: "1px solid #cbd5e1",
                                background: "white",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer"
                            }}
                            title="Re-create / Refresh room details"
                        >
                            {loading ? "⏳ Working..." : "🔄 Refresh Details"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
