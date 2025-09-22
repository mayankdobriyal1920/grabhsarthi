import React, { useRef, useEffect, useState, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import { chatbubbleOutline, heartOutline, heart, volumeMute, volumeLow } from "ionicons/icons";
import moment from "moment-timezone";

const DOUBLE_TAP_MS = 280;
const TAP_MOVE_TOLERANCE = 12;

export default function CommunityPageCardComponent({ post, openPostPage, callFunctionToLikeDisLikePost }) {
    const [showHeartBurst, setShowHeartBurst] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const wrapperRef = useRef(null);
    const videoRef = useRef(null);
    const observerRef = useRef(null);

    // --- Double/single tap state ---
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
        const v = videoRef.current;
        if (!v) return;
        // toggle mute
        const nextMuted = !v.muted;
        v.muted = nextMuted;
        setIsMuted(nextMuted);
    }, []);

    const triggerLike = useCallback(() => {
        setShowHeartBurst(true);
        callFunctionToLikeDisLikePost(post.id);
        window.setTimeout(() => setShowHeartBurst(false), 700);
    }, [post.id, callFunctionToLikeDisLikePost]);

    // --- Pointer handlers (mouse + touch unified) ---
    const onPointerDown = (e) => {
        // Ignore non-primary buttons (right click, etc.)
        if (e.button && e.button !== 0) return;
        if (e.currentTarget.setPointerCapture) {
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch (err) {
                // ignore if pointer capture fails
            }
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

        // Check double-tap: within time + radius of first tap
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

        // Schedule single tap; will be canceled if second tap arrives in time
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

    // ---- Video autoplay when on screen & iOS inline fixes ----
    useEffect(() => {
        if (post.object_type !== "video") return;

        const node = wrapperRef.current;
        const video = videoRef.current;
        if (!node || !video) return;

        // Ensure muted before trying to play (necessary for autoplay on mobile)
        try {
            video.muted = true;
            setIsMuted(true);
        } catch (err) {
            // ignore
        }

        // Make the video behave inline on iOS:
        // - DOM properties
        try {
            if ("playsInline" in video) video.playsInline = true;
            // set attributes for older iOS webkit requirement
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "true");
        } catch (err) {
            // ignore
        }

        // Clean up any previous observer
        if (observerRef.current) {
            try {
                observerRef.current.disconnect();
            } catch (err) {
                console.log('e')
            }
            observerRef.current = null;
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!video) return;
                    // When more than half visible, try to play (muted)
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        // Ensure muted, then try play
                        if (!video.muted) {
                            video.muted = true;
                            setIsMuted(true);
                        }
                        const playPromise = video.play();
                        if (playPromise && typeof playPromise.then === "function") {
                            playPromise.catch((err) => {
                                // Autoplay may fail — that's ok, user can tap to play
                                // Keep a console message for debugging
                                // console.debug("video.play() failed:", err);
                            });
                        }
                    } else {
                        // pause when not visible
                        try {
                            video.pause();
                        } catch (err) {
                            console.log('e')
                        }
                    }
                });
            },
            { threshold: [0, 0.5, 1], root: null, rootMargin: "0px" }
        );

        observerRef.current.observe(node);

        return () => {
            if (observerRef.current) {
                try {
                    observerRef.current.disconnect();
                } catch (err) {
                    console.log('e')
                }
                observerRef.current = null;
            }
        };
    }, [post.object_type]);

    // Mute button handler — stop propagation so parent tap handlers don't fire
    const onMuteButtonClick = (e) => {
        e.stopPropagation?.();
        e.nativeEvent?.stopImmediatePropagation?.();
        const v = videoRef.current;
        if (!v) return;
        const nextMuted = !v.muted;
        v.muted = nextMuted;
        setIsMuted(nextMuted);
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
                // Use pointer events for both mouse + touch
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                // Prevent native dblclick zoom/selection weirdness
                onDoubleClick={(e) => e.preventDefault()}
                style={{
                    // helps mobile Safari: disables double-tap to zoom and reduces delays
                    touchAction: "manipulation",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                }}
            >
                <p>{post.message}</p>

                {/* IMAGE */}
                {post.object_type === "image" && post.object_url && (
                    <div className="media-wrapper">
                        <img src={post.object_url} alt="post" className="post-image" draggable={false} />
                        {showHeartBurst && (
                            <div className="heart-burst">
                                <IonIcon icon={heart} />
                            </div>
                        )}
                    </div>
                )}

                {/* VIDEO */}
                {post.object_type === "video" && post.object_url && (
                    <div className="media-wrapper video-wrapper">
                        {/* DEBUG VIDEO - add this temporarily */}
                        <video
                            ref={videoRef}
                            src={post.object_url}
                            className="post-video"
                            playsInline
                            loop
                            muted
                            controls={false}
                            preload="metadata"
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
                            {isMuted ? <IonIcon icon={volumeMute} /> : <IonIcon icon={volumeLow} />}
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
