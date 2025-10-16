import React, {useEffect} from "react";
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonToolbar} from "@ionic/react";
import {arrowBack} from "ionicons/icons";
import useStore from "../zustand/useStore";
import {
    actionToGetAppVideoLibraryDataByCategory,
    actionToSetCommonActionSheetPopupData
} from "../apiHelper/CommonAction";
import {FacebookLoader} from "./FacebookLoader";
import {useHistory} from "react-router-dom";
import ComingSoonComponent from "./ComingSoonComponent";

const VideoLibraryCategoryVideosComponent = () => {
    const {commonActionSheetPopupData,appVideoLibraryDataByCategory,userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;
    const {loading,videoLibraryData} = appVideoLibraryDataByCategory;
    const {page,popupData} = commonActionSheetPopupData;
    const history = useHistory();

    const goBack = () => {
        actionToSetCommonActionSheetPopupData('');
    };

    useEffect(() => {
        if(page === 'video-page'){
            actionToGetAppVideoLibraryDataByCategory(popupData?.category);
        }
    }, [page,popupData]);

    const goToSubscriptionPage = ()=>{
        goBack();
        history.replace('/dashboard/subscription');
    }

    return (
        <IonModal isOpen={page === 'video-page'} className="community-post-page">
            <IonHeader className="community-post-page-header sub-page-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={()=>goBack()}>
                            <IonIcon icon={arrowBack}></IonIcon>
                        </IonButton>
                    </IonButtons>
                    <div className={"header_title_sub_header"}>
                        {popupData?.category}
                    </div>
                </IonToolbar>
                {(!userInfo?.active_subscription?.id) && (
                    <div onClick={()=>goToSubscriptionPage()} className={"plan_warning_header"}>
                       Click here to purchase subscription to access video library
                    </div>
                )}
            </IonHeader>
            <IonContent fullscreen className={"dash-wrap classes-page-dashboard"}>
                <div className="classes-page-dashboard-inner video-cat-container">
                  <div className="video-library">
                    {/*<div className="filter-bar">*/}
                    {/*    <button className="filter-btn">1st Trimester <IonIcon icon={chevronDown}/></button>*/}
                    {/*    <button className="filter-btn">Category <IonIcon icon={chevronDown}/></button>*/}
                    {/*</div>*/}
                    <div className="video-list">
                        {loading ?
                            <>
                                <div className="video-card loader_section">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                                <div className="video-card loader_section">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                                <div className="video-card loader_section">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                                <div className="video-card loader_section">
                                    <FacebookLoader type={"facebookStyle"} item={1}/>
                                </div>
                            </>
                            :
                            <>
                                <ComingSoonComponent/>
                                {/*{videoLibraryData.map((video) => (*/}
                                {/*    <div key={video.id} className="video-card">*/}
                                {/*        <div className={"video_student_lib_section"}>*/}
                                {/*            <img src={video.thumbnail} alt={video.title} />*/}
                                {/*            <div className="play-overlay">*/}
                                {/*                <IonIcon icon={playCircle} className="play-icon" />*/}
                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*        <div className="video-info">*/}
                                {/*            <div className="video-info-bottom-card">*/}
                                {/*                <h3>{video.title}</h3>*/}
                                {/*                <span className="tag">{video.category}</span>*/}
                                {/*            </div>*/}
                                {/*            <div className={"vid_description"}>{video?.description}</div>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*))}*/}
                            </>
                        }
                    </div>
                </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default VideoLibraryCategoryVideosComponent;
