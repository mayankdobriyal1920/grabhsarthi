import React, { useRef, useEffect, useState, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import { chatbubbleOutline, heartOutline, heart, volumeMute, volumeHigh } from "ionicons/icons";
import moment from "moment-timezone";

const DOUBLE_TAP_MS = 280;
const TAP_MOVE_TOLERANCE = 12;
let activeVideoRef = null;

export default function CommunityPageCardComponent({
                                                       post,
                                                       isMuted,
                                                       toggleMuted,
                                                       openPostPage,
                                                       callFunctionToLikeDisLikePost,
                                                   }) {
    const [showHeartBurst, setShowHeartBurst] = useState(false);
    const [videoVisible, setVideoVisible] = useState(false); // <-- whether to reveal/play the video

    const wrapperRef = useRef(null);
    const videoRef = useRef(null);
    const observerRef = useRef(null);
    const singleTapTimer = useRef(null);
    const firstTapTime = useRef(0);
    const firstTapPos = useRef(null);
    const downPos = useRef({ x: 0, y: 0 });

    const clearSingle = () => {
        if (singleTapTimer.current) {
            window.clearTimeout(singleTapTimer.current);
            singleTapTimer.current = null;
        }
    };

    const resetTapState = () => {
        clearSingle();
        firstTapTime.current = 0;
        firstTapPos.current = null;
    };

    const handleSingleTap = useCallback(() => {
        toggleMuted();
    }, [toggleMuted]);

    const triggerLike = useCallback(() => {
        setShowHeartBurst(true);
        callFunctionToLikeDisLikePost(post.id);
        window.setTimeout(() => setShowHeartBurst(false), 700);
    }, [post.id, callFunctionToLikeDisLikePost]);

    // Pointer handlers (mouse + touch unified)
    const onPointerDown = (e) => {
        if (e.button && e.button !== 0) return;
        if (e.currentTarget.setPointerCapture) {
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch (err) {console.log('')}
        }
        downPos.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
        const dx = Math.abs(e.clientX - downPos.current.x);
        const dy = Math.abs(e.clientY - downPos.current.y);
        if (dx > TAP_MOVE_TOLERANCE || dy > TAP_MOVE_TOLERANCE) {
            resetTapState();
            return;
        }

        const now = performance.now();

        if (
            firstTapTime.current > 0 &&
            now - firstTapTime.current <= DOUBLE_TAP_MS &&
            firstTapPos.current &&
            Math.abs(e.clientX - firstTapPos.current.x) <= TAP_MOVE_TOLERANCE &&
            Math.abs(e.clientY - firstTapPos.current.y) <= TAP_MOVE_TOLERANCE
        ) {
            clearSingle();
            triggerLike();
            resetTapState();
            return;
        }

        firstTapTime.current = now;
        firstTapPos.current = { x: e.clientX, y: e.clientY };
        clearSingle();
        singleTapTimer.current = window.setTimeout(() => {
            handleSingleTap();
            resetTapState();
        }, DOUBLE_TAP_MS + 10);
    };

    const onPointerCancel = () => {
        resetTapState();
    };

    useEffect(() => {
        return () => {
            clearSingle();
        };
    }, []);

    // --- Video observer for autoplay + single play enforcement ---
    useEffect(() => {
        if (post.object_type !== "video") return;
        const node = wrapperRef.current;
        const video = videoRef.current;
        if (!node || !video) return;

        if ("playsInline" in video) video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "true");

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!video) return;
                    const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5;

                    if (isVisible) {
                        // Pause any other playing video before starting this one
                        if (activeVideoRef && activeVideoRef !== video) {
                            try {
                                activeVideoRef.pause();
                            } catch {console.log('')}
                        }

                        const playPromise = video.play();
                        if (playPromise && typeof playPromise.then === "function") {
                            playPromise.catch((err) => {
                                console.warn("Autoplay blocked:", err);
                            });
                        }
                        setTimeout(()=>{
                            activeVideoRef = video;
                            setVideoVisible(true);
                        })
                    } else {
                        if (video === activeVideoRef) {
                            activeVideoRef = null;
                        }
                        try {
                            video.pause();
                        } catch {console.log('')}
                        setVideoVisible(false);
                    }
                });
            },
            { threshold: [0.5], root: null }
        );

        observerRef.current.observe(node);

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [post.object_type, post.object_url]);

    const onMuteButtonClick = (e) => {
        e.stopPropagation?.();
        toggleMuted();
    };

    return (
        <div ref={wrapperRef} key={post.id} className="card community-card">
            {/* User Info */}
            <div className="card-header">
                <div style={{ color: "#ffffff", background: post.color }} className="user_avatar_circle_cont">
                    {(post.user_name || "U").substring(0, 1)}
                </div>
                <div className="user-info user_info_name_status_time_container">
                    <h3 className="user-name">{post.user_name || "User"}</h3>
                    <div className="user_info_status_time">
            <span className={`status ${post.role === 2 ? "pregnant" : "ttc"}`}>
              {post.role === 2 ? "Pregnant" : "TTC"}
            </span>
                        <span className="time">{moment(post?.created_at).fromNow()}</span>
                    </div>
                </div>
            </div>

            {/* Post Message & Media */}
            <div
                className="card-body"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onDoubleClick={(e) => e.preventDefault()}
                style={{
                    touchAction: "manipulation",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                }}
            >
                <p>{post.message}</p>

                {/* IMAGE */}
                {post.object_type === "image" && post.object_url && (
                    <div className="media-wrapper image-wrapper">
                        <img src={post.object_url} alt="post" className="post-image" draggable={false} />
                        {showHeartBurst && (
                            <div className="heart-burst">
                                <IonIcon icon={heart} />
                            </div>
                        )}
                    </div>
                )}

                {/* VIDEO with poster overlay */}
                {post.object_type === "video" && post.object_url && (
                    <div className={`media-wrapper video-wrapper`} style={{ position: "relative" }}>
                        {/* Poster/thumbnail sits above the video until videoVisible === true */}
                        {post.poster_url && (
                            <img
                                src={post.poster_url}
                                alt="poster"
                                className="video-poster"
                                style={{
                                    display: videoVisible ? "none" : "block",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                }}
                                draggable={false}
                            />
                        )}

                        <video
                            ref={videoRef}
                            src={post.object_url}
                            className="post-video"
                            playsInline
                            loop
                            muted={isMuted}
                            controls={false}
                            preload="none"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                // keep the video element present but visually hidden while poster shows
                                opacity: videoVisible ? 1 : 0,
                                transition: "opacity 200ms ease",
                                borderRadius: 6,
                            }}
                        />

                        {showHeartBurst && (
                            <div className="heart-burst">
                                <IonIcon icon={heart} />
                            </div>
                        )}
                        <button
                            type="button"
                            className="mute-btn"
                            aria-label={isMuted ? "Unmute video" : "Mute video"}
                            title={isMuted ? "Unmute" : "Mute"}
                            onClick={onMuteButtonClick}
                            onPointerDown={(e) => e.stopPropagation?.()}
                        >
                            {isMuted ? <IonIcon icon={volumeMute} /> : <IonIcon icon={volumeHigh} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer">
                <div className="post_card_footer" onClick={() => triggerLike()}>
                    <IonIcon icon={post.liked_by_you ? heart : heartOutline} className={`like-icon ${post.liked_by_you ? "liked" : ""}`} />
                    <span>{post.like_counts}</span>
                </div>
                <div className="post_card_footer" onClick={() => openPostPage(post?.id)}>
                    <IonIcon icon={chatbubbleOutline} className="comment-icon" />
                    <span>{post.comment_counts}</span>
                </div>
            </div>
        </div>
    );
}
