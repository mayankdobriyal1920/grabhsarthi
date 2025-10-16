import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonIcon, IonModal } from "@ionic/react";
import { close, fitnessOutline, timerOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData, actionToUpsertDailyTaskProgress} from "../apiHelper/CommonAction";
import {_dailyTaskYogaStore, _getUserProfileTrimesterFrontend, yogaTasksVideosPoster} from "../apiHelper/CommonHelper";

export default function DailyTaskYogTaskComponent() {
    const { commonActionSheetPopupData, userAuthDetail } = useStore();
    const {dailyTasksToday} = useStore();
    const { userInfo } = userAuthDetail;
    const { page } = commonActionSheetPopupData;

    const [todayYoga, setTodayYoga] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const radius = 51;
    const circumference = 2 * Math.PI * radius;

    const progressRef = useRef(null);

    // add a ref
    const videoRef = useRef(null);

    // watch for play/pause toggle
    useEffect(() => {
        if (videoRef.current) {
            if (isRunning) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    }, [isRunning]);

    // reset video on pose change
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [currentIndex]);


    // ✅ Select Today’s Yoga
    useEffect(() => {
        const getTodayYoga = (phase, trimester = null) => {
            const dayIndex = new Date().getDay();
            const useComboA = dayIndex % 2 === 0;
            if (phase === "ttc") {
                return useComboA ? _dailyTaskYogaStore.ttc.comboA : _dailyTaskYogaStore.ttc.comboB;
            } else {
                return useComboA
                    ? _dailyTaskYogaStore.pregnant[trimester].comboA
                    : _dailyTaskYogaStore.pregnant[trimester].comboB;
            }
        };

        if (page === "daily-task-yoga" && userInfo) {
            if (userInfo?.role === 2) {
                const trimesterNumber = _getUserProfileTrimesterFrontend(userInfo?.profile?.last_period_date);
                const trimester = `trimester${trimesterNumber}`;
                setTodayYoga(getTodayYoga("pregnant", trimester));
            } else {
                setTodayYoga(getTodayYoga("ttc"));
            }
            setCurrentIndex(0);
            setElapsed(0);
            setIsRunning(false);
        }
    }, [page, userInfo]);

    // ✅ Timer Logic
    useEffect(() => {
        let interval;
        if (isRunning && todayYoga[currentIndex]) {
            interval = setInterval(() => {
                setElapsed((prev) => {
                    if (prev >= todayYoga[currentIndex].duration * 60) {
                        clearInterval(interval);
                        handleNextPose();
                        return todayYoga[currentIndex].duration * 60;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, currentIndex, todayYoga]);

    const handleNextPose = async () => {
        if (currentIndex < todayYoga.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setElapsed(0);
            setIsRunning(false);

            try {
                await actionToUpsertDailyTaskProgress({
                    task: 'YOGA',
                    progressPercent: (20 * (currentIndex + 1)),
                    details: {
                        index:currentIndex + 1,
                        combo: currentIndex + 1,
                        total_minutes: 0,
                        completed_at: new Date().toISOString(),
                    },
                });
            } catch (e) {
                console.error('Failed to persist yoga progress', e);
            }

        } else {
            try {
                const totalMinutes = todayYoga.reduce((acc, p) => acc + (Number(p.duration) || 0), 0);
                await actionToUpsertDailyTaskProgress({
                    task: 'YOGA',
                    progressPercent: 100,
                    details: {
                        index:todayYoga.length - 1,
                        combo: todayYoga.length,
                        total_minutes: totalMinutes,
                        completed_at: new Date().toISOString(),
                    },
                });
            } catch (e) {
                console.error('Failed to persist yoga progress', e);
            }
            actionToSetCommonActionSheetPopupData("");
        }
    };

    const handleSkipPose = () => {
        handleNextPose();
    };

    const handleStartStop = () => {
        setIsRunning((prev) => !prev);
    };

    const handleGoHomePage = () => {
        actionToSetCommonActionSheetPopupData("");
    };

    // ✅ Timer + Progress
    const currentPose = todayYoga[currentIndex];
    const totalSeconds = currentPose ? currentPose.duration * 60 : 1;
    const offset = circumference - (elapsed / totalSeconds) * circumference;
    const minutes = Math.floor((totalSeconds - elapsed) / 60);
    const seconds = (totalSeconds - elapsed) % 60;
    const sessionProgress = ((currentIndex + 1) / todayYoga.length) * 100;

    // ✅ Native Statusbar
    useEffect(() => {
        if (Capacitor.isNativePlatform() && page === "daily-task-yoga") {
            StatusBar.setBackgroundColor({ color: "#ea9518" }).then(() => {
                StatusBar.setStyle({ style: Style.Dark });
            });
            return () => {
                StatusBar.setBackgroundColor({ color: "#ffffff" }).then(() => {
                    StatusBar.setStyle({ style: Style.Light });
                });
            };
        }
    }, [page]);


    useEffect(()=>{
        if(page === "daily-task-yoga" && dailyTasksToday?.data?.['YOGA']){
            setCurrentIndex(dailyTasksToday?.data?.['YOGA']?.details?.index | 0);
        }
    },[dailyTasksToday,page])

    return (
        <IonModal isOpen={page === "daily-task-yoga"}>
            <IonContent fullscreen className="pregnant-dashboard task_section_container_wrap">
                <div className="header_for_task_section">
                    <h1>Yoga</h1>
                    <div className="session-info">
                        <div className="duration time_sec_c">
                            <IonIcon icon={timerOutline} />
                            <span>~15 mins</span>
                        </div>
                        <div className="duration count_sec">
                            <IonIcon icon={fitnessOutline} />
                            <span>{todayYoga.length} poses today</span>
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>

                {currentPose && (
                    <div className="dash-wrap pregnant-dashboard-wrap">
                        {/* Pose Image */}
                        <div className="card_inner_pose_info_img pose-image">
                            <video
                                ref={videoRef}
                                src={currentPose.url}
                                loop
                                poster={yogaTasksVideosPoster}
                                muted
                                playsInline
                                style={{ width: "100%", borderRadius: "10px" }}
                            />
                        </div>

                        {/* Pose Info */}
                        <div className="card_inner_pose_info pose-info">
                            <h2 className="pose-title">{currentPose.title}</h2>
                            <p className="pose-description">{currentPose.description}</p>
                        </div>

                        {/* Timer Controls */}
                        <div className="timer-container-outer start_stop_end_button_container card tasks yoga_task_card">
                            <div className={"button_in_time_y_task"} onClick={handleStartStop}>
                                {isRunning ? "Pause" : "Start"}
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
                                        style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                                    ></circle>
                                </svg>
                                <span>{`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}</span>
                            </div>
                            <div className={"button_in_time_y_task_skip_task"} onClick={handleSkipPose}>
                                Next
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-row">
                            <div className="progress-row-ttl">
                                <span className="dont_text_t_session_progress">Session Progress</span>
                                <span className="dont_text_t">
                                  Pose {currentIndex + 1} of {todayYoga.length}
                                </span>
                            </div>
                            <div className="track">
                                <div className="fill" style={{ width: `${sessionProgress}%` }} />
                            </div>
                        </div>
                    </div>
                )}
            </IonContent>
        </IonModal>
    );
}
