import React, { useState } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { chatbubbleOutline, heartOutline } from "ionicons/icons";
import moment from "moment-timezone";
import { actionToSetCommonActionSheetPopupData } from "../apiHelper/CommonAction";
import { _generateRandomPastelColor } from "../apiHelper/CommonHelper";
import AddCommunityPostModal from "../components/AddCommunityPostModal";

const posts = [
    {
        id: 1,
        user_name: "Aarav",
        status: "TTC",
        created_at: "2025-08-30 08:20",
        comment_count: 5,
        message: "Started tracking my cycle, feeling positive!",
        likes: 18,
        object_type: "text",
        color: _generateRandomPastelColor(),
    },
    {
        id: 2,
        user_name: "Priya",
        status: "Pregnant",
        created_at: "2025-08-30 12:45",
        comment_count: 22,
        created_by: 2,
        message: "Enjoying my morning meditation with the baby bump.",
        likes: 42,
        object_type: "image",
        object_url: "https://images.pexels.com/photos/396133/pexels-photo-396133.jpeg",
        color: _generateRandomPastelColor(),
    },
    {
        id: 3,
        user_name: "Mayank",
        status: "TTC",
        created_at: "2025-08-30 15:10",
        created_by: 1,
        comment_count: 9,
        object_type: "video",
        object_url: "https://images.pexels.com/photos/396133/pexels-photo-396133.jpeg",
        message: "We’re focusing on a healthier lifestyle together.",
        likes: 27,
        color: _generateRandomPastelColor(),
    },
];

export default function CommunityPage() {
    const openPostPage = (id) => {
        actionToSetCommonActionSheetPopupData("community-post", { id });
    };
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <IonPage className="community-page">
            <IonContent fullscreen className="main-content-page community-dashboard main-content-page">
                <div className="dash-wrap community-dashboard-wrap">
                    {posts.map((post) => (
                        <div key={post.id} onClick={() => openPostPage(post.id)} className="card community-card">
                            {/* User Info */}
                            <div className="card-header">
                                <div style={{ color: "#ffffff", background: post.color }} className={"user_avatar_circle_cont"}>
                                    {(post.user_name || "U").substring(0, 1)}
                                </div>
                                <div className="user-info user_info_name_status_time_container">
                                    <h3 className="user-name">{post.user_name || "User"}</h3>
                                    <div className={"user_info_status_time"}>
                                        <span className={`status ${post.status === "Pregnant" ? "pregnant" : "ttc"}`}>{post.status || "TTC"}</span>
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
                                    <span>{post.likes}</span>
                                </div>
                                <div className={"post_card_footer"}>
                                    <IonIcon icon={chatbubbleOutline} className="comment-icon" />
                                    <span>{post.comment_count}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Floating New Post Button */}
                    <div className="new-post-btn">
                        <button onClick={() => setIsSheetOpen(true)}>
                            <span className="plus">+</span>
                            <span>New Post</span>
                        </button>
                    </div>
                </div>

                {/* Separate Page/Component Modal */}
                <AddCommunityPostModal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} onReady={(payload) => console.log("Payload from modal", payload)} />
            </IonContent>
        </IonPage>
    );
}
