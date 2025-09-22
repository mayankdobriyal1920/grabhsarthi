import React, { useRef, useEffect, useState, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import { chatbubbleOutline, heartOutline, heart, volumeMute, volumeLow } from "ionicons/icons";
import moment from "moment-timezone";

const DOUBLE_TAP_MS = 280;
const TAP_MOVE_TOLERANCE = 12;

export default function CommunityPageCardComponent({post,openPostPage,callFunctionToLikeDisLikePost}) {
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
        const next = !v.muted;
        v.muted = next;
        setIsMuted(next);
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
            e.currentTarget.setPointerCapture(e.pointerId);
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

    // ---- Video autoplay when on screen ----
    useEffect(() => {
        if (post.object_type !== "video") return;

        const node = wrapperRef.current;
        const video = videoRef.current;
        if (!node || !video) return;

        // Start muted to allow autoplay on mobile
        video.muted = true;
        setIsMuted(true);

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    if (!video) return;
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        try {
                            await video.play();
                        } catch (e) {
                            console.log('e')
                        }
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: [0, 0.5, 1] }
        );

        observerRef.current.observe(node);

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [post.object_type]);

    return (
        <div
            ref={wrapperRef}
            key={post.id}
            className="card community-card">
            {/* User Info */}
            <div className="card-header">
                <div
                    style={{ color: "#ffffff", background: post.color }}
                    className="user_avatar_circle_cont"
                >
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
            <div className="card-body"
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
                        <video
                            ref={videoRef}
                            src={post.object_url}
                            className="post-video"
                            playsInline
                            loop
                            muted
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
                        >
                            {isMuted ? <IonIcon icon={volumeMute} /> : <IonIcon icon={volumeLow} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer">
                <div className="post_card_footer" onClick={()=>triggerLike()}>
                    <IonIcon
                        icon={post.liked_by_you ? heart : heartOutline}
                        className={`like-icon ${post.liked_by_you ? "liked" : ""}`}
                    />
                    <span>{post.like_counts}</span>
                </div>
                <div className="post_card_footer" onClick={()=>openPostPage(post?.id)}>
                    <IonIcon icon={chatbubbleOutline} className="comment-icon" />
                    <span>{post.comment_counts}</span>
                </div>
            </div>
        </div>
    );
}
