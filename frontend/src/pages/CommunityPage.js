import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { chatbubbleOutline, heartOutline} from "ionicons/icons";
import {_generateRandomPastelColor} from "../apiHelper/CommonHelper";
import moment from "moment";
import {useHistory} from "react-router";

const posts = [
    {
        id: 1,
        user_name: "Aarav",
        status: "TTC",
        created_at: "2025-08-30 08:20",
        comment_count: 5,
        message: "Started tracking my cycle, feeling positive!",
        likes: 18,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=21",
        color: _generateRandomPastelColor(),
    },
    {
        id: 2,
        user_name: "Priya",
        status: "Pregnant",
        created_at: "2025-08-30 12:45",
        comment_count: 22,
        message: "Enjoying my morning meditation with the baby bump.",
        likes: 42,
        image: "https://images.pexels.com/photos/396133/pexels-photo-396133.jpeg",
        avatar: "https://i.pravatar.cc/150?img=25",
        color: _generateRandomPastelColor(),
    },
    {
        id: 3,
        user_name: "Rohan",
        status: "TTC",
        created_at: "2025-08-30 15:10",
        comment_count: 9,
        message: "We’re focusing on a healthier lifestyle together.",
        likes: 27,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=33",
        color: _generateRandomPastelColor(),
    },
    {
        id: 4,
        user_name: "Neha",
        status: "Pregnant",
        created_at: "2025-08-30 18:40",
        comment_count: 17,
        message: "Doctor suggested prenatal yoga – feeling refreshed already.",
        likes: 50,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=36",
        color: _generateRandomPastelColor(),
    },
    {
        id: 5,
        user_name: "Karan",
        status: "TTC",
        created_at: "2025-08-30 21:25",
        comment_count: 7,
        message: "We started eating more home-cooked healthy meals.",
        likes: 20,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=45",
        color: _generateRandomPastelColor(),
    },
    {
        id: 6,
        user_name: "Ananya",
        status: "Pregnant",
        created_at: "2025-08-31 06:50",
        comment_count: 14,
        message: "Excited to start my third trimester journey!",
        likes: 39,
        image: "https://images.pexels.com/photos/1648356/pexels-photo-1648356.jpeg",
        avatar: "https://i.pravatar.cc/150?img=47",
        color: _generateRandomPastelColor(),
    },
    {
        id: 7,
        user_name: "Vikram",
        status: "TTC",
        created_at: "2025-08-31 09:15",
        comment_count: 10,
        message: "Evening walks together are keeping us motivated.",
        likes: 25,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=49",
        color: _generateRandomPastelColor(),
    },
    {
        id: 8,
        user_name: "Meera",
        status: "Pregnant",
        created_at: "2025-08-31 10:40",
        comment_count: 19,
        message: "Cooking nutritious meals with lots of veggies these days.",
        likes: 44,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=52",
        color: _generateRandomPastelColor(),
    },
    {
        id: 9,
        user_name: "Siddharth",
        status: "TTC",
        created_at: "2025-08-31 12:05",
        comment_count: 8,
        message: "Doctor advised regular checkups – feeling hopeful.",
        likes: 28,
        image: null,
        avatar: "https://i.pravatar.cc/150?img=55",
        color: _generateRandomPastelColor(),
    },
    {
        id: 10,
        user_name: "Ishita",
        status: "Pregnant",
        created_at: "2025-08-31 13:50",
        comment_count: 25,
        message: "Feeling the baby’s first kicks today – magical moment!",
        likes: 60,
        image: "https://images.pexels.com/photos/3875211/pexels-photo-3875211.jpeg",
        avatar: "https://i.pravatar.cc/150?img=60",
        color: _generateRandomPastelColor(),
    },
];


const CommunityPage = () => {
    const history = useHistory();
    const openPostPage = (id)=>{
        history.push('/community-post/'+id)
    }
    return (
        <IonPage className="community-page">
            <IonContent
                fullscreen
                className="main-content-page community-dashboard main-content-page"
            >
                <div className="dash-wrap community-dashboard-wrap">
                    {posts.map((post) => (
                        <div key={post.id} onClick={()=>openPostPage(post.id)} className="card community-card">
                            {/* User Info */}
                            <div className="card-header">
                                <div style={{color:'#ffffff',background:post.color}} className={"user_avatar_circle_cont"}>
                                    {post.user_name.substring(0,1)}
                                </div>
                                <div className="user-info user_info_name_status_time_container">
                                    <h3 className="user-name">{post.user_name}</h3>
                                    <div className={"user_info_status_time"}>
                                            <span className={`status ${
                                                post.status === "Pregnant" ? "pregnant" : "ttc"
                                            }`}>
                                              {post.status}
                                            </span>
                                        <span className="time">{moment(post?.created_at).fromNow()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Post Message */}
                            <div className="card-body">
                                <p>{post.message}</p>
                                {post.image && (
                                    <img src={post.image} alt="post" className="post-image" />
                                )}
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
                        <button>
                            <span className="plus">+</span>
                            <span>New Post</span>
                        </button>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CommunityPage;
