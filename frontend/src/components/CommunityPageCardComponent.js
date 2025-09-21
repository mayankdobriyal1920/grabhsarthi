import React from "react";
import {IonIcon } from "@ionic/react";
import { chatbubbleOutline, heartOutline } from "ionicons/icons";
import moment from "moment-timezone";

export default function CommunityPageCardComponent({post,openPostPage}) {

    return (
        <div key={post.id} onClick={() => openPostPage(post.id)} className="card community-card">
            {/* User Info */}
            <div className="card-header">
                <div style={{ color: "#ffffff", background: post.color }} className={"user_avatar_circle_cont"}>
                    {(post.user_name || "U").substring(0, 1)}
                </div>
                <div className="user-info user_info_name_status_time_container">
                    <h3 className="user-name">{post.user_name || "User"}</h3>
                    <div className={"user_info_status_time"}>
                        <span className={`status ${post.role === 2 ? "pregnant" : "ttc"}`}>{post.role === 2 ? "Pregnant" : "TTC"}</span>
                        <span className="time">{moment(post?.created_at).fromNow()}</span>
                    </div>
                </div>
            </div>

            {/* Post Message */}
            <div className="card-body">
                <p>{post.message}</p>
                {post.object_type === "image" && post.object_url && <img src={post.object_url} alt="post" className="post-image" />}
                {post.object_type === "video" && post.object_url && <video src={post.object_url} controls className="post-image" />}
            </div>

            {/* Footer with likes */}
            <div className="card-footer">
                <div className={"post_card_footer"}>
                    <IonIcon icon={heartOutline} className="like-icon" />
                    <span>{post.like_counts}</span>
                </div>
                <div className={"post_card_footer"}>
                    <IonIcon icon={chatbubbleOutline} className="comment-icon" />
                    <span>{post.comment_counts}</span>
                </div>
            </div>
        </div>
    );
}
