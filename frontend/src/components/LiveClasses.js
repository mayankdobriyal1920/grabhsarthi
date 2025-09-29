import React, {useState} from "react";
import prenatalImg from "../theme/img/classImg/prenatal-img.png";
import garbhsanskaarImg from "../theme/img/classImg/garbhsanskaar-img.png";
import pregnencyyogaImg from "../theme/img/classImg/pregnencyyoga-img.png";
import useStore from "../zustand/useStore";
import { useHistory } from "react-router-dom";
import { FacebookLoader } from "./FacebookLoader";
import moment from "moment-timezone";
import {actionToSaveSelectedLiveClassDataData} from "../apiHelper/CommonAction";
import {IonFooter} from "@ionic/react";

const LiveClasses = () => {
    const { userAuthDetail, allScheduledLiveClassData } = useStore();
    const { userInfo } = userAuthDetail;
    const { loading, scheduledLiveClassData } = allScheduledLiveClassData;
    const [selectedLiveClassId,setSelectedLiveClassId] = useState(null);
    const history = useHistory();

    const getClassImage = (type) => {
        switch (type) {
            case "TTC": return pregnencyyogaImg;
            case "Garbh": return garbhsanskaarImg;
            case "Prenatal": return prenatalImg;
            case "Postnatal": return pregnencyyogaImg;
            default: return prenatalImg; // Fallback
        }
    };

    const goToSubscriptionPage = () => {
        history.replace('/dashboard/subscription');
    };


    const openMeetingUrl = (meeting_link)=>{
        if(meeting_link){
            window.open(meeting_link,'_blank');
        }
    }

    const callFunctionToSaveSelectedData = (liveClassId)=>{
        actionToSaveSelectedLiveClassDataData(liveClassId);
    }

    return (
        <div className="live-classes">
            {(userInfo?.active_subscription?.plan_type !== 'PREMIUM') ? (
                    <div className="plan_warning_header for_live_classes_page">
                        Click to upgrade subscription to access live classes
                        <button onClick={goToSubscriptionPage} className={"subscription_page_button_live_class"} type="button">Subscription</button>
                    </div>
                ):
                <>
                    {(userInfo?.profile?.selected_live_class_id) ?
                        <>
                            {loading ? (
                                <div className="class-list">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="class-card">
                                            <FacebookLoader type={"facebookStyle"} item={1} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="class-list">
                                    {scheduledLiveClassData.map((cls) => (
                                        <React.Fragment key={cls?.id}>
                                            <div key={cls.id} className="class-card select_class_li">
                                                <div className="class-card-inner">
                                                    <div className="class-img">
                                                        <img src={getClassImage(cls.type)} alt={cls.title} />
                                                    </div>
                                                    <div className="class-info">
                                                        <h3>{cls.title}</h3>
                                                        <p>{cls.instructor_name}</p>
                                                        <div className="class-time">{moment(cls.start_time , 'HH:mm:ss').format('hh:mm A')}</div>
                                                        <div className="class-time-desc">Duration (1 Hour)</div>
                                                        <div className="class-time-desc-active-days">Mon,Tue,Thu,Fri</div>
                                                    </div>
                                                </div>
                                                <div className={"class_live_description"}>
                                                    {cls?.description}
                                                </div>
                                            </div>
                                            <button onClick={()=>openMeetingUrl(cls?.meeting_link)}
                                                    disabled={!cls?.meeting_link}
                                                    className={`subscription_page_button_live_class`}>
                                                Open Class
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </>
                        :
                        <div className="select_live_class_main_container">
                            {loading ? (
                                <div className="class-list">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="class-card">
                                            <FacebookLoader type={"facebookStyle"} item={1} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>

                                    <div className="class-list">
                                        {scheduledLiveClassData.map((cls) => (
                                            <div key={cls.id} className={`class-card select_class_li ${selectedLiveClassId === cls?.id ? 'active' : ''}`}
                                                 onClick={()=>setSelectedLiveClassId(cls.id)}><div className="class-card-inner">
                                                <div className="class-img">
                                                    <img src={getClassImage(cls.type)} alt={cls.title} />
                                                </div>
                                                <div className="class-info">
                                                    <h3>{cls.title}</h3>
                                                    <p>{cls.instructor_name}</p>
                                                    <div className="class-time">{moment(cls.start_time , 'HH:mm:ss').format('hh:mm A')}</div>
                                                    <div className="class-time-desc">Duration (1 Hour)</div>
                                                    <div className="class-time-desc-active-days">Mon,Tue,Thu,Fri</div>
                                                </div>
                                            </div>
                                                <div className={"class_live_description"}>
                                                    {cls?.description}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button disabled={!selectedLiveClassId} onClick={()=>callFunctionToSaveSelectedData(selectedLiveClassId)} className={"subscription_page_button_live_class"} type="button">
                                        Save Selected Class
                                    </button>
                                </>
                            )}
                        </div>
                    }
                </>
            }
        </div>
    );
};

export default LiveClasses;
