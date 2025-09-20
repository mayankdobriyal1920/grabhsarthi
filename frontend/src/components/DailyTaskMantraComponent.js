import React, {useEffect, useRef, useState} from "react";
import {IonPage, IonContent, IonIcon, IonModal} from "@ionic/react";
import {close, fitnessOutline, ribbonOutline, timerOutline} from "ionicons/icons";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData} from "../apiHelper/CommonAction";

export default function DailyTaskMantraComponent() {
    const {commonActionSheetPopupData} = useStore();
    const {page} = commonActionSheetPopupData;

    const handleGoHomePage = () =>{
        actionToSetCommonActionSheetPopupData('');
    }

    const radius = 76;
    const circumference = 2 * Math.PI * radius;
    const totalSeconds = 120;

    const progressRef = useRef(null);
    const [elapsed, setElapsed] = useState(40);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setElapsed((prev) => {
    //             if (prev >= totalSeconds) {
    //                 clearInterval(interval);
    //                 return totalSeconds;
    //             }
    //             return prev + 1;
    //         });
    //     }, 1000);
    //
    //     return () => clearInterval(interval);
    // }, []);

    const offset = circumference - (elapsed / totalSeconds) * circumference;
    const minutes = Math.floor((totalSeconds - elapsed) / 60);
    const seconds = (totalSeconds - elapsed) % 60;

    useEffect(()=>{
        if(Capacitor.isNativePlatform()){
            StatusBar.setBackgroundColor({ color: '#f491f2' }).then(()=>{
                StatusBar.setStyle({ style:Style.Dark });
            });

            return ()=>{
                StatusBar.setBackgroundColor({ color: '#ffffff' }).then(()=>{
                    StatusBar.setStyle({ style:Style.Light });
                });
            }
        }
    },[])

    return (
        <IonModal isOpen={page === 'daily-task-mantra'}>
            <IonContent fullscreen scrollEvents={true} className="pregnant-dashboard task_section_container_wrap mantra_main_container">
                <div className="header_for_task_section mantra">
                    <h1>Mantra</h1>
                    <div className="session-info">
                        <div className="duration time_sec_c">
                            <IonIcon icon={timerOutline}/>
                            <span>~10 mins</span>
                        </div>
                        <div className="duration count_sec">
                            <IonIcon icon={fitnessOutline}/>
                            <span>Mantra Chant</span>
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>
                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className="timer-container-outer card tasks mantra_task_card start_stop_end_button_container">
                        <div className="timer-container">
                            <svg>
                                <circle className="bg" cx="80" cy="80" r={radius}></circle>
                                <circle
                                    className="progress"
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    ref={progressRef}
                                    style={{strokeDasharray: circumference, strokeDashoffset: offset}}></circle>
                            </svg>
                            <span>{`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}</span>
                        </div>
                        <div className={"mantra_message_text"}>
                            {`ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं। भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥" यह बुद्धि, ज्ञान और सकारात्मक ऊर्जा के लिए है.`}
                        </div>
                        <div className={"session_start_stop_skin_button"}>
                            <div className={"button_in_time_y_task"}>
                                Start
                            </div>
                            <div className={"button_in_time_y_task_skip_task"}>
                                Mark Done
                            </div>
                        </div>
                    </div>
                    <div className="samvaad_bottom_streek_section mantra">
                        <IonIcon icon={ribbonOutline} className="streak-icon" />
                        <span className="streak-text">Day 4 of 7 Mantra streak</span>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
