import React, {useCallback, useState} from "react";
import { IonPage, IonContent } from "@ionic/react";
import {
    actionToGetCommunityAllPostData,
    actionToLikeDislikeCommunityPost,
    actionToSetCommonActionSheetPopupData
} from "../apiHelper/CommonAction";
import AddCommunityPostModal from "../components/AddCommunityPostModal";
import useStore from "../zustand/useStore";
import {FacebookLoader} from "../components/FacebookLoader";
import CommunityPageCardComponent from "../components/CommunityPageCardComponent";

export default function CommunityPage({handleScroll,renderHeaderPage}) {
    const {communityPostIsInUploadingMode,communityAllPostData} = useStore();
    const {loading,communityPost,totalCount} = communityAllPostData;
    const observerRef = React.useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    const openPostPage = (id) => {
        actionToSetCommonActionSheetPopupData("community-post", { id });
    };
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const toggleMuted = useCallback(() => setIsMuted((m) => !m), [isMuted,setIsMuted]);

    const lastJobElementRef = React.useCallback(
        (node) => {
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && communityPost?.length < totalCount) {
                    actionToGetCommunityAllPostData(false); // Load next page
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [totalCount,communityPost, actionToGetCommunityAllPostData]
    );

    const callFunctionToLikeDisLikePost = (postId)=>{
        actionToLikeDislikeCommunityPost(postId);
    }

    return (
        <IonPage className="community-page">
            {/*/////// RENDER HEADER PART ////////*/}
            {renderHeaderPage && renderHeaderPage()}
            {/*/////// RENDER HEADER PART ////////*/}
            {(communityPostIsInUploadingMode?.status) && (
                <div className={"progress_header_loader_in_c_p"} style={{width:`${communityPostIsInUploadingMode?.progress}%`}}/>
            )}
            <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll} className="main-content-page community-dashboard main-content-page">
                <div className="dash-wrap community-dashboard-wrap">
                    {(loading) ?
                        <>
                            <div className="card community-card">
                                <div className="card-body">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                            </div>
                            <div className="card community-card">
                                <div className="card-body">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                            </div>
                            <div className="card community-card">
                                <div className="card-body">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                            </div>
                            <div className="card community-card">
                                <div className="card-body">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            {communityPost.map((post,index) => {
                                if (index === communityPost.length - 1) {
                                    return (
                                        <div ref={lastJobElementRef} key={post.id}>
                                            <CommunityPageCardComponent
                                                openPostPage={openPostPage}
                                                post={post}a
                                                key={post.id}
                                                isMuted={isMuted}
                                                toggleMuted={toggleMuted}
                                                callFunctionToLikeDisLikePost={callFunctionToLikeDisLikePost}
                                            />
                                        </div>
                                    );
                                }
                                return (
                                    <CommunityPageCardComponent
                                        openPostPage={openPostPage}
                                        post={post}
                                        key={post.id}
                                        isMuted={isMuted}
                                        toggleMuted={toggleMuted}
                                        callFunctionToLikeDisLikePost={callFunctionToLikeDisLikePost}
                                    />
                                );
                            })}
                        </>
                    }
                    {(communityPostIsInUploadingMode?.status) ?
                        <div className="new-post-btn">
                            <button type={"button"}>
                                <span className="percentage">{communityPostIsInUploadingMode?.progress}%</span>
                                <span>Uploading</span>
                            </button>
                        </div>
                        :
                        <div className="new-post-btn">
                            <button type={"button"} onClick={() => {
                                setIsMuted(true);
                                setIsSheetOpen(true);
                            }}>
                                <span className="plus">+</span>
                                <span>New Post</span>
                            </button>
                        </div>
                    }
                </div>
                {/* Separate Page/Component Modal */}
                <AddCommunityPostModal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
            </IonContent>
        </IonPage>
    );
}
