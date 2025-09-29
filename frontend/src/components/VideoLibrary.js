import React, { useEffect, useState } from "react";
import useStore from "../zustand/useStore";
import { _videosCategoryPregnant, _videosCategoryTTC } from "../apiHelper/CommonHelper";
import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import {actionToSetCommonActionSheetPopupData} from "../apiHelper/CommonAction";
import {useHistory} from "react-router-dom";

const VideoLibrary = () => {
    const { userAuthDetail } = useStore();
    const { userInfo } = userAuthDetail;
    const history = useHistory();

    const [videosCategory, setVideosCategory] = useState([]);

    useEffect(() => {
        if (userInfo?.role === 2) {
            setVideosCategory(_videosCategoryPregnant);
        } else {
            setVideosCategory(_videosCategoryTTC);
        }
    }, [userInfo]);

    const openVideoCatPage = (video)=>{
        actionToSetCommonActionSheetPopupData('video-page',video);
    }

    const goToSubscriptionPage = ()=>{
        history.replace('/dashboard/subscription');
    }

    return (
        <div className="video-library-category">
            {(!userInfo?.active_subscription?.id) && (
                <div onClick={()=>goToSubscriptionPage()} className={"plan_warning_header"}>
                    Click here to purchase subscription to access video library
                </div>
            )}
            <div className="video-category-list">
                {videosCategory.map((video) => (
                    <div key={video.id} onClick={()=>openVideoCatPage(video)} className="video-cat-card">
                        {/* Thumbnail */}
                        <div className="video-cat-thumbnail">
                            <img src={video.thumbnail} alt={video.title} />
                        </div>

                        {/* Info Section */}
                        <div className="video-cat-info">
                            <div className="info-left">
                                <h3 className="video-title">{video.title}</h3>
                                <span
                                    className={`status-badge ${
                                        userInfo?.role === 2 ? "pregnant" : "ttc"
                                    }`}
                                >
                              {userInfo?.role === 2 ? "Pregnant" : "TTC"}
                            </span>
                            </div>
                            <div className="info-right">
                                <IonIcon icon={chevronForward} className="forward-icon" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoLibrary;
