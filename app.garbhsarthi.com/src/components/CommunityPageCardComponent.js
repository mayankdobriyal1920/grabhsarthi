import React, { useRef, useEffect, useState, useCallback } from "react";
import {IonIcon, IonLoading, useIonAlert} from "@ionic/react";
import {chatbubbleOutline, heartOutline, heart, volumeMute, volumeHigh, trash} from "ionicons/icons";
import moment from "moment-timezone";
import useStore from "../zustand/useStore";
import {actionToDeleteCommunityPostData} from "../apiHelper/CommonAction";

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
    const {userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;
    const [showHeartBurst, setShowHeartBurst] = useState(false);
    const [loadingApiCall, setLoadingApiCall] = useState(false);
    const [presentAlert] = useIonAlert();

    // video visibility/render gates
    const [renderVideo, setRenderVideo] = useState(false); // mount <video> only when visible
    const [videoVisible, setVideoVisible] = useState(false); // is this card visible enough to try play
    const [ready, setReady] = useState(false); // becomes true after first frame is available (or playing)

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
            } catch {console.log('')}
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

    // --- IntersectionObserver: decide when to render & play the video ---
    useEffect(() => {
        if (post.object_type !== "video") return;
        const node = wrapperRef.current;
        if (!node) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5;

                if (isVisible) {
                    setRenderVideo(true); // mount the <video> element
                    setVideoVisible(true);
                } else {
                    const v = videoRef.current;
                    if (v && v === activeVideoRef) activeVideoRef = null;
                    try {
                        v?.pause();
                    } catch {console.log('')}
                    setVideoVisible(false);
                    // ⚠️ Do NOT set ready(false) here; it prevents video from showing on next entry
                    // setReady(false);
                }
            },
            { threshold: [0.5], root: null }
        );

        observerRef.current.observe(node);
        return () => observerRef.current?.disconnect();
    }, [post.object_type, post.object_url]);

    // --- When the <video> is mounted & visible, request autoplay immediately ---
    useEffect(() => {
        const v = videoRef.current;
        if (post.object_type !== "video") return;
        if (!renderVideo || !videoVisible || !v) return;

        // Ensure inline muted autoplay flags (critical for Android)
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "true");
        v.muted = isMuted;
        v.autoplay = true;

        const tryPlay = async () => {
            // Pause any other playing video before starting this one
            if (activeVideoRef && activeVideoRef !== v) {
                try {
                    activeVideoRef.pause();
                } catch {console.log('')}
            }
            try {
                await v.play();
                activeVideoRef = v;
                // Poster remains until onCanPlay/onLoadedData/onPlaying marks ready=true
            } catch (err) {
                // Autoplay might be blocked — keep poster visible; user tap will trigger play
            }
        };

        tryPlay();
    }, [renderVideo, videoVisible, isMuted, post.object_type]);

    // Mark as ready when the first frame is actually available or playback started.
    const onCanPlay = () => setReady(true);
    const onLoadedData = () => setReady(true);
    const onLoadedMetadata = () => {
        const v = videoRef.current;
        if (v && v.readyState >= 2) setReady(true);
    };
    const onPlaying = () => setReady(true);

    const onMuteButtonClick = (e) => {
        e.stopPropagation?.();
        toggleMuted();
    };

    const openDeleteAlertPopup = (post)=>{
        presentAlert({
            header: 'Confirm Delete',
            cssClass:"confirm_alert_custom",
            message: 'Are you sure you want to delete this post?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Yes',
                    handler: async () => {
                        setLoadingApiCall(true);
                        await actionToDeleteCommunityPostData(post);
                        setLoadingApiCall(false);
                    },
                },
            ],
        });
    }

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
                {post?.created_by === userInfo?.id &&
                    <div className={"three_dot_dropdown_card"} onClick={()=>openDeleteAlertPopup(post)}>
                        <IonIcon icon={trash}/>
                    </div>
                }
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
                    <div className="media-wrapper video-wrapper" style={{ position: "relative" }}>
                        {/* Poster stays above the video until it's ready */}
                        {post.poster_url && (
                            <img
                                src={post.poster_url}
                                alt="poster"
                                className="video-poster"
                                style={{
                                    display: !ready ? "block" : "none",
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

                        {/* Mount the video element only when visible */}
                        {renderVideo && (
                            <video
                                ref={videoRef}
                                src={post.object_url}
                                className="post-video"
                                playsInline
                                loop
                                muted={isMuted}
                                autoPlay
                                controls={false}
                                preload="metadata"
                                onCanPlay={onCanPlay}
                                onLoadedData={onLoadedData}
                                onLoadedMetadata={onLoadedMetadata}
                                onPlaying={onPlaying}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    opacity: ready ? 1 : 0, // fade-in when the first frame is ready OR playing
                                    transition: "opacity 180ms ease",
                                    borderRadius: 6,
                                }}
                            />
                        )}

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

            <IonLoading
                className="loading_loader_spinner_container"
                isOpen={loadingApiCall}
                message={"Deleting Post..."}
            />

            {/* Inline styles: hide Android big play & any early controls flash */}
            <style>{`
        /* Hide the initial big start playback button on Android/WebKit */
        .post-video::-webkit-media-controls-start-playback-button {
          display: none !important;
          -webkit-appearance: none;
        }
        /* Some devices briefly show the controls enclosure; hide it */
        .post-video::-webkit-media-controls-enclosure {
          display: none !important;
        }
      `}</style>
        </div>
    );
}
