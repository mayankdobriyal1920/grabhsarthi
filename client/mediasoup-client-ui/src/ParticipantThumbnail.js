
import React, { useRef, useState, useEffect } from "react";

function ParticipantThumbnail({
                                  p, isTeacher, onKick, onMute, pinnedSocketId, togglePin
                              }) {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        if (p?.streams?.video && videoRef.current) {
            videoRef.current.srcObject = p.streams.video;
            videoRef.current.play().catch(err => console.warn("Video playback failed", err));
        }
        if (p?.streams?.audio && audioRef.current) {
            audioRef.current.srcObject = p.streams.audio;
            audioRef.current.play().catch(err => console.warn("Audio playback failed", err));
        }
    }, [p]);

    const callFunctionToSetOnMute = (socketId,mutedAudio,kind = "audio")=>{
        onMute(socketId,mutedAudio,kind);
        setMenuOpen(false);
    }

    const callFunctionToSetKick = (id)=>{
        onKick(id);
        setMenuOpen(false);
    }

    return (
        <div className={`main-video-grid ${p.role !== "teacher" ?  'participant' : 'teacher'} ${pinnedSocketId && pinnedSocketId !== p.socketId ? "hidden" : ""}`} data-role={p.role}>
            {p.streams?.video &&
                <>
                    {p.streams?.video && !p.mutedVideo ? (
                        <video ref={videoRef} autoPlay playsInline />
                    ) : (
                        <div className="name-placeholder">
                            <span>{p.name || p.socketId}</span>
                        </div>
                    )}
                </>
            }
            {p.streams?.audio && <audio ref={audioRef} autoPlay playsInline />}

            {isTeacher && p.role !== "teacher" ? (
                <div className="actions-in-part-three">
                    <button
                        className={`pin-badge ${pinnedSocketId === p.socketId ? "active" : ""}`}
                        onClick={() => togglePin(p.socketId)}
                    >
                        {pinnedSocketId === p.socketId ? "Unpin" : "Pin"}
                    </button>
                    <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
                    {menuOpen && (
                        <div ref={menuRef} className="dropdown-menu">
                            <button onClick={() => callFunctionToSetOnMute(p.socketId,p.mutedAudio, "audio")}>
                                {p.mutedAudio ? "Muted" : "Mute"}
                            </button>
                            <button onClick={() => callFunctionToSetKick(p.socketId)}>Kick</button>
                        </div>
                    )}
                </div>
            ):
                (
                    <div className="actions-in-part-three">
                        <button
                            className={`pin-badge ${pinnedSocketId === p.socketId ? "active" : ""}`}
                            onClick={() => togglePin(p.socketId)}
                        >
                            {pinnedSocketId === p.socketId ? "Unpin" : "Pin"}
                        </button>
                    </div>
                )
            }
        </div>
    );
}

export default ParticipantThumbnail;