import React, {useEffect, useState} from "react";
import {
    IonContent,
    IonFooter,
    IonButton,
    IonIcon, IonHeader, IonButtons, IonToolbar, IonModal,
} from "@ionic/react";
import {arrowBack, sendOutline} from "ionicons/icons";
import moment from "moment-timezone";
import useStore from "../zustand/useStore";
import {
    actionToGetCommunityPostCommentDataById, actionToPostNewCommentInCommunityPost,
    actionToSetCommonActionSheetPopupData
} from "../apiHelper/CommonAction";
import {FacebookLoader} from "../components/FacebookLoader";

const CommunityPostPage = () => {
    const {communityPostCommentData} = useStore();
    const {loading,postCommentData} = communityPostCommentData;
    const {commonActionSheetPopupData} = useStore();
    const {page,popupData} = commonActionSheetPopupData;
    const [newComment, setNewComment] = useState("");

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        actionToPostNewCommentInCommunityPost({post_id:popupData?.id,message:newComment});
        setNewComment("");
    };

    useEffect(() => {
        if(popupData?.id) {
            actionToGetCommunityPostCommentDataById(popupData?.id)
        }
    }, [popupData]);

    const goBack = () => {
        actionToSetCommonActionSheetPopupData('');
    };

    return (
        <IonModal isOpen={page === 'community-post'} className="community-post-page">
            <IonHeader className="community-post-page-header sub-page-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={()=>goBack()}>
                            <IonIcon icon={arrowBack}></IonIcon>
                        </IonButton>
                    </IonButtons>
                    <div className={"header_title_sub_header"}>
                        Community Post
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className={"community-post-dashboard"}>
                <div className="dash-wrap community-post-dashboard-wrap community-dashboard-wrap">
                    {/* Comments */}
                    <div className="comments-section">
                        {(loading) ?
                            <div className="comment-card">
                                <div className="comment-content">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                            </div>
                            :(postCommentData?.length) ?
                                <>
                                    {postCommentData.map((c) => (
                                        <div key={c.id} className="comment-card">
                                            <div style={{color:'#ffffff',background:c.color}} className={"comment-avatar user_avatar_circle_cont"}>
                                                {c.user_name.substring(0,1)}
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-name">{c.user_name}</span>
                                                    <span className="comment-time">{moment(c.created_at).fromNow()}</span>
                                                </div>
                                                <p className="comment-text" dangerouslySetInnerHTML={{__html:c.message}}/>
                                            </div>
                                        </div>
                                    ))}
                                </>
                                :<div className={"no_comments_yet_section_container"}>
                                    <div>No Comments Yet</div>
                                </div>
                        }
                    </div>
                    {/* Comments */}
                </div>
            </IonContent>
            {/* Comment Input */}
            <IonFooter className="comment-footer">
                <div className="comment-input-wrap">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="comment-input"
                    />
                    <IonButton fill="clear" onClick={handleAddComment}>
                        <IonIcon icon={sendOutline} />
                    </IonButton>
                </div>
            </IonFooter>
            {/* Comment Input */}
        </IonModal>
    );
};

export default CommunityPostPage;
