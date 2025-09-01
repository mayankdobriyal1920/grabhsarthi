import React, {useEffect, useState} from "react";
import {
    IonPage,
    IonContent,
    IonFooter,
    IonButton,
    IonIcon, IonHeader, IonButtons, IonTitle,
} from "@ionic/react";
import {arrowBack,sendOutline} from "ionicons/icons";
import moment from "moment/moment";
import {_generateRandomPastelColor} from "../apiHelper/CommonHelper";
import {useHistory,useParams} from "react-router-dom";


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

const CommunityPostPage = () => {
    const {id} = useParams();
    const [post,setPost] = useState(null);
    const [comments, setComments] = useState([
        {
            id: 1,
            user_name: "Mia",
            status: "Pregnant",
            created_at: "2025-08-31 13:50",
            message: "Sounds lovely! 🌿",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=22",
        },
        {
            id: 2,
            user_name: "Sarah",
            status: "Pregnant",
            created_at: "2025-08-31 13:50",
            color: _generateRandomPastelColor(),
            message: "Walking has been a huge mood booster for me.",
            avatar: "https://i.pravatar.cc/150?img=23",
        },
        {
            id: 3,
            user_name: "Olivia",
            status: "TTC",
            created_at: "2025-08-31 13:50",
            message: "Getting fresh air is the best!",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=24",
        },
        {
            id: 4,
            user_name: "Aarav",
            status: "TTC",
            created_at: "2025-08-31 14:10",
            message: "Morning walks are my favorite time of the day.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=25",
        },
        {
            id: 5,
            user_name: "Ananya",
            status: "TTC",
            created_at: "2025-08-31 14:12",
            message: "Yoga helps me stay calm and focused.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=26",
        },
        {
            id: 6,
            user_name: "Rohan",
            status: "Pregnant",
            created_at: "2025-08-31 14:15",
            message: "I love cycling on weekends!",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=27",
        },
        {
            id: 7,
            user_name: "Isha",
            status: "Pregnant",
            created_at: "2025-08-31 14:18",
            message: "Meditation in the mornings sets a positive tone for the day.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=28",
        },
        {
            id: 8,
            user_name: "Kabir",
            status:"Pregnant",
            created_at: "2025-08-31 14:20",
            message: "I enjoy evening walks with my dog.",
            avatar: "https://i.pravatar.cc/150?img=29",
            color: _generateRandomPastelColor(),
        },
        {
            id: 9,
            user_name: "Priya",
            status: "TTC",
            created_at: "2025-08-31 14:22",
            message: "Herbal teas and fresh air make me feel refreshed.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=30",
        },
        {
            id: 10,
            user_name: "Vikram",
            status: "TTC",
            created_at: "2025-08-31 14:25",
            message: "Stretching exercises help me start the day right.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=31",
        },
        {
            id: 11,
            user_name: "Sanya",
            status: "TTC",
            created_at: "2025-08-31 14:28",
            message: "Journaling my thoughts after walks really calms me down.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=32",
        },
        {
            id: 12,
            user_name: "Arjun",
            status: "Pregnant",
            created_at: "2025-08-31 14:30",
            message: "Listening to music while jogging makes it fun.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=33",
        },
        {
            id: 13,
            user_name: "Neha",
            status: "Pregnant",
            created_at: "2025-08-31 14:32",
            message: "A short walk after meals really helps digestion.",
            color: _generateRandomPastelColor(),
            avatar: "https://i.pravatar.cc/150?img=34",
        }
    ]);
    const [newComment, setNewComment] = useState("");
    const history = useHistory();

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const newEntry = {
            id: comments.length + 1,
            user_name: "You",
            status: null,
            time: "Just now",
            message: newComment,
            avatar: "https://i.pravatar.cc/150?img=64",
        };
        setComments([newEntry, ...comments]);
        setNewComment("");
    };

    useEffect(() => {
        if(id) {
            let postData = posts.filter((p) => Number(p?.id) === Number(id));
            setPost(postData[0]);
        }
    }, [id]);

    const goBack = () => {
        history.goBack();
    };

    return (
        <IonPage className="community-post-page">
            <IonHeader className="community-post-page-header">
                <IonButtons>
                    <IonButton onClick={()=>goBack()} slot={'start'}>
                        <IonIcon icon={arrowBack}></IonIcon>
                    </IonButton>
                    <IonTitle>
                        Community Post
                    </IonTitle>
                </IonButtons>
            </IonHeader>
            <IonContent fullscreen className={"community-post-dashboard"}>
                <div className="dash-wrap community-post-dashboard-wrap community-dashboard-wrap">
                    {/* Main Post */}
                    {(post) ?
                      <div className="card community-card">
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
                    </div> :''
                    }
                    {/* Main Post */}
                    {/* Comments */}
                    <div className="comments-section">
                    {comments.map((c) => (
                        <div key={c.id} className="comment-card">
                            <div style={{color:'#ffffff',background:c.color}} className={"comment-avatar user_avatar_circle_cont"}>
                                {c.user_name.substring(0,1)}
                            </div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <span className="comment-name">{c.user_name}</span>
                                    {c.status && (
                                        <span
                                            className={`status ${
                                                c.status === "Pregnant" ? "pregnant" : "ttc"
                                            }`}
                                        >
                                      {c.status}
                                    </span>
                                    )}
                                    <span className="comment-time">{moment(c.created_at).fromNow()}</span>
                                </div>
                                <p className="comment-text">{c.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
                    {/* Comments */}
                </div>
            </IonContent>
            {/* Comment Input */}
            <IonFooter className="comment-footer">
                <div className="comment-input-wrap">
                    <input
                        value={newComment}
                        onClick={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="comment-input"
                    />
                    <IonButton fill="clear" onClick={handleAddComment}>
                        <IonIcon icon={sendOutline} />
                    </IonButton>
                </div>
            </IonFooter>
            {/* Comment Input */}
        </IonPage>
    );
};

export default CommunityPostPage;
