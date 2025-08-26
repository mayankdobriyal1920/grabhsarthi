import React, { useEffect, useRef, useState } from "react";
import { IonPage, IonContent, IonHeader, IonToolbar, IonButton, IonButtons, IonTitle, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {close, fitness, fitnessOutline, pause, timer, timerOutline} from "ionicons/icons";
import catAndCowPose from "../theme/img/yogaTasks/cat-cow-pose.gif";

export default function DailyTaskYogTaskComponent() {
    const history = useHistory();
    const handleGoHomePage = () => history.goBack();

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

    return (
        <IonPage>
            {/*<IonHeader className="with_login-header main_app_header">*/}
            {/*    <IonToolbar className="with_login-toolbar inner_pages_toolbar">*/}
            {/*        <IonTitle className="title_in_header_task">Yoga</IonTitle>*/}
            {/*        <IonButtons slot="end">*/}
            {/*            <div onClick={handleGoHomePage} className={"end_session_button_container"}>*/}
            {/*                <div className={"button_in_time_y_task"}>*/}
            {/*                    End session*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </IonButtons>*/}
            {/*    </IonToolbar>*/}
            {/*</IonHeader>*/}

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
                    <div onClick={handleGoHomePage} className="session-info-end-session">
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

                    <div className="timer-container-outer start_stop_end_button_container">
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
