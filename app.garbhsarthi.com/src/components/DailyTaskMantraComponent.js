import React, {useEffect, useRef, useState} from "react";
import {IonContent, IonHeader, IonIcon, IonModal, IonToolbar} from "@ionic/react";
import {close, fitnessOutline, timerOutline} from "ionicons/icons";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData, actionToUpsertDailyTaskProgress} from "../apiHelper/CommonAction";
import {_dailyTasksMantraData} from "../apiHelper/CommonHelper";

export default function DailyTaskMantraComponent() {
    const {commonActionSheetPopupData, dailyTasksToday} = useStore();
    const {page} = commonActionSheetPopupData;

    const radius = 76;
    const circumference = 2 * Math.PI * radius;
    const totalSeconds = 600; // ~10 mins

    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [selectedMantra, setSelectedMantra] = useState(_dailyTasksMantraData[0]);

    const progressRef = useRef(null);

    const handleGoHomePage = () => actionToSetCommonActionSheetPopupData("");

    // Pick a random mantra when opened
    useEffect(() => {
        if (page === "daily-task-mantra") {
            setSelectedMantra(_dailyTasksMantraData[Math.floor(Math.random() * _dailyTasksMantraData.length)]);
            const saved = dailyTasksToday?.data?.["MANTRA"];
            const prevElapsed = Number(saved?.details?.elapsed_seconds || 0);
            const prevCompleted = Number(saved?.progress_percent || 0) >= 100;
            setElapsed(prevCompleted ? 0 : Math.min(prevElapsed, totalSeconds));
            setIsRunning(false);
        }
    }, [page, dailyTasksToday]);

    // Timer
    useEffect(() => {
        if (!isRunning || page !== "daily-task-mantra") return;
        const id = setInterval(() => {
            setElapsed((prev) => {
                const next = prev + 1;
                if (next >= totalSeconds) {
                    clearInterval(id);
                    handleMarkDone(next).finally(() => setIsRunning(false));
                    return totalSeconds;
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [isRunning, page]);

    const percent = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
    const offset = circumference - (elapsed / totalSeconds) * circumference;
    const remaining = Math.max(0, totalSeconds - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const persistProgress = async (pp, el) => {
        try {
            await actionToUpsertDailyTaskProgress({
                task: "MANTRA",
                progressPercent: pp,
                details: {
                    mantra: selectedMantra.text,
                    meaning: selectedMantra.meaning,
                    elapsed_seconds: el,
                    total_seconds: totalSeconds,
                    completed_at: pp >= 100 ? new Date().toISOString() : null,
                },
            });
        } catch (e) {
            console.error("Mantra progress save failed", e);
        }
    };

    const handleStartPause = async () => {
        if (percent >= 100) {
            // restart
            setElapsed(0);
            setIsRunning(true);
            return;
        }
        if (isRunning) {
            await persistProgress(percent, elapsed);
            setIsRunning(false);
        } else {
            setIsRunning(true);
        }
    };

    const handleMarkDone = async (forcedElapsed = null) => {
        const el = forcedElapsed ?? elapsed;
        await persistProgress(100, Math.max(el, totalSeconds));
        handleGoHomePage();
    };

    useEffect(() => {
        if (Capacitor.isNativePlatform() && page === "daily-task-mantra") {
            StatusBar.setBackgroundColor({ color: "#f491f2" }).then(() => {
                StatusBar.setStyle({ style: Style.Dark });
            });
            return () => {
                StatusBar.setBackgroundColor({ color: "#ffffff" }).then(() => {
                    StatusBar.setStyle({ style: Style.Light });
                });
            };
        }
    }, [page]);

    return (
        <IonModal isOpen={page === "daily-task-mantra"}>
            <IonHeader className={"main_header_in_task"}>
                <IonToolbar className={"main_toolbar_in_task header_for_task_section mantra"}>
                    <div className="inner_container_main">
                        <div className={"main_toolbar_in_task_title"}>Mantra</div>
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
                            <IonIcon icon={close}/>
                            <span>End Session</span>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen scrollEvents={true} className="pregnant-dashboard task_section_container_wrap mantra_main_container">
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
                            <div style={{fontWeight: "bold", marginBottom: 8}}>{selectedMantra.text}</div>
                            <div style={{fontSize: 14, color: "#444"}}>{selectedMantra.meaning}</div>
                        </div>

                        <div className={"session_start_stop_skin_button"}>
                            <div className={"button_in_time_y_task"} onClick={handleStartPause}>
                                {isRunning ? "Pause" : (percent >= 100 ? "Restart" : "Start")}
                            </div>
                            <div className={"button_in_time_y_task_skip_task"} onClick={() => handleMarkDone()}>
                                Mark Done
                            </div>
                        </div>

                        <div className="dont_text_t_session_progress" style={{marginTop: 12}}>
                            Progress: {percent}%
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
