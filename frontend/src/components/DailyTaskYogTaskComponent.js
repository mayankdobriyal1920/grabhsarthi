import React, { useEffect, useRef, useState } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {close, fitnessOutline, timerOutline} from "ionicons/icons";
import catAndCowPose from "../theme/img/yogaTasks/cat-cow-pose.gif";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";

export default function DailyTaskYogTaskComponent() {
    const history = useHistory();
    const handleGoHomePage = () =>{
        history.goBack();
        window.history.back();
    }

    const radius = 51;
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
            StatusBar.setBackgroundColor({ color: '#ea9518' }).then(()=>{
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
        <IonPage>
            <IonContent fullscreen scrollEvents={true} className="pregnant-dashboard task_section_container_wrap">
                <div className="header_for_task_section">
                    <h1>Yoga</h1>
                    <div className="session-info">
                        <div className="duration time_sec_c">
                            <IonIcon icon={timerOutline}/>
                            <span>~15 mins</span>
                        </div>
                        <div className="duration count_sec">
                            <IonIcon icon={fitnessOutline}/>
                            <span>5 poses today</span>
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>
                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className="card_inner_pose_info_img pose-image">
                        <img src={catAndCowPose} alt="yoga"/>
                    </div>

                    <div className="card_inner_pose_info pose-info">
                        <h2 className="pose-title">Cat & Cow</h2>
                        <p className="pose-description">
                            Improve your posture and balance and is believed to be a good stress reliever
                            and calming pose since you link the movements with breathing.
                        </p>
                    </div>

                    <div className="timer-container-outer start_stop_end_button_container card tasks yoga_task_card">
                        <div className={"button_in_time_y_task"}>
                            Start
                        </div>
                        <div className="timer-container">
                            <svg>
                                <circle className="bg" cx="55" cy="55" r={radius}></circle>
                                <circle
                                    className="progress"
                                    cx="55"
                                    cy="55"
                                    r={radius}
                                    ref={progressRef}
                                    style={{strokeDasharray: circumference, strokeDashoffset: offset}}></circle>
                            </svg>
                            <span>{`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}</span>
                        </div>
                        <div className={"button_in_time_y_task_skip_task"}>
                            Skip
                        </div>
                    </div>

                    <div className="progress-row">
                        <div className="progress-row-ttl">
                            <span className="dont_text_t_session_progress">Session Progress</span>
                            <span className="dont_text_t">Pose 2 of 5</span>
                        </div>
                        <div className="track">
                            <div className="fill" style={{width: `${0.10 * 100}%`}}/>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
