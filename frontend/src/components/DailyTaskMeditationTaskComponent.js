import React, { useRef, useState } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {close, fitnessOutline, ribbonOutline, timerOutline} from "ionicons/icons";

export default function DailyTaskMeditationTaskComponent() {
    const history = useHistory();
    const handleGoHomePage = () => history.goBack();

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

    return (
        <IonPage>
            <IonContent fullscreen scrollEvents={true} className="pregnant-dashboard task_section_container_wrap meditation_main_container">
                <div className="header_for_task_section meditation">
                    <h1>Meditation</h1>
                    <div className="session-info">
                        <div className="duration time_sec_c">
                            <IonIcon icon={timerOutline}/>
                            <span>~5 mins</span>
                        </div>
                        <div className="duration count_sec">
                            <IonIcon icon={fitnessOutline}/>
                            <span>Breathing</span>
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>
                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className="timer-container-outer card tasks meditation_task_card start_stop_end_button_container">
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
                        <div className={"meditation_message_text"}>
                            Inhale deep... hold... exhale slowly
                        </div>
                        <div className={"meditation_ohm_svg_center"}>
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 238.000000 227.000000" preserveAspectRatio="xMidYMid meet">
                                <g transform="translate(0.000000,227.000000) scale(0.100000,-0.100000)" fill="var(--gs-meditation-task-color)" stroke="none">
                                    <path d="M1487 2082 c-31 -32 -57 -62 -57 -68 0 -5 27 -36 60 -69 l60 -60 66 66 65 66 -62 61 c-35 34 -66 62 -69 62 -3 0 -31 -26 -63 -58z"/>
                                    <path d="M1855 1790 c-101 -69 -260 -106 -378 -90 -78 11 -134 31 -215 76 l-64 35 21 -30 c65 -91 209 -183 341 -218 76 -20 241 -22 310 -4 76 20 160 53 160 63 0 10 -116 185 -127 191 -5 2 -26 -8 -48 -23z"/>
                                    <path d="M612 1740 c-40 -10 -94 -29 -120 -40 -56 -25 -162 -92 -162 -103 0 -14 130 -267 138 -267 4 0 30 20 57 44 70 60 167 121 234 147 82 31 175 24 233 -17 23 -16 56 -49 73 -72 25 -36 30 -55 33 -115 3 -62 1 -77 -20 -106 -42 -64 -78 -76 -202 -74 l-109 3 7 -88 c11 -134 10 -132 67 -132 140 0 269 -116 269 -242 0 -86 -49 -187 -121 -252 -103 -92 -291 -119 -449 -62 -128 46 -256 135 -339 236 l-44 55 6 -52 c8 -71 60 -191 113 -263 108 -147 315 -252 496 -252 298 1 536 251 538 565 0 75 19 107 65 107 13 0 49 9 80 21 70 26 131 85 214 209 101 150 140 185 218 194 113 15 206 -60 248 -200 19 -63 19 -232 0 -303 -22 -84 -75 -177 -135 -240 -64 -66 -114 -93 -188 -99 -59 -5 -174 21 -193 44 -6 8 -16 14 -22 14 -6 0 -24 12 -39 27 -36 34 -35 19 2 -65 38 -84 88 -136 163 -172 166 -80 400 27 502 230 56 111 75 200 75 352 0 156 -22 255 -81 368 -51 97 -105 154 -175 187 -49 22 -66 25 -133 21 -145 -8 -214 -59 -364 -265 -145 -200 -184 -222 -295 -167 -63 31 -142 116 -142 151 0 16 17 44 48 78 79 86 101 198 66 330 -30 118 -115 211 -234 260 -70 28 -281 31 -378 5z"/>
                                </g>
                            </svg>
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
                    <div className="samvaad_bottom_streek_section meditation">
                        <IonIcon icon={ribbonOutline} className="streak-icon" />
                        <span className="streak-text">Day 4 of 7 Meditation streak</span>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
