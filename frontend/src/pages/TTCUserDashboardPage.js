import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import {
    bodyOutline,
    chatbubbleEllipsesOutline,
    musicalNotesOutline,
    happyOutline,
    videocamOutline,
    libraryOutline,
    pulseOutline,
    peopleOutline,
    leafOutline,
    flame, calendarOutline, heartOutline, nutritionOutline, bandageOutline
} from "ionicons/icons";
import CycleCalendarComponent from "../components/CycleCalendarComponent";

export default function TTCUserDashboardPage({ handleScroll }) {
    // progress example: 3/4 tasks = 75%
    const progress = 0.75;

    return (
        <IonPage>
            <IonContent
                fullscreen
                scrollEvents={true}
                onIonScroll={handleScroll}
                className="dash --peach-bg pregnant-dashboard ttc-dashboard main-contant-page">
                <div className="dash-wrap pregnant-dashboard-wrap">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Namaste, Monika!</h1>
                        <p>Let’s track your cycle</p>
                    </div>

                    {/* Baby Growth Snapshot */}
                    <CycleCalendarComponent/>

                    {/* Daily Tasks */}
                    <div className="card tasks">
                        <h3>Daily Tasks</h3>

                        <div className="tasks-grid">
                            <div className="task">
                                <div className="task-icon">
                                    <IonIcon icon={bodyOutline} />
                                </div>
                                <span>Yoga</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <IonIcon icon={heartOutline} />
                                </div>
                                <span>Mindset</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <IonIcon icon={nutritionOutline} />
                                </div>
                                <span>Diet</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <IonIcon icon={bandageOutline} />
                                </div>
                                <span>Folate Reminder</span>
                            </div>

                            <div className="task">
                                <div className="task-icon">
                                    <IonIcon icon={happyOutline} />
                                </div>
                                <span>Mood</span>
                            </div>
                        </div>

                        <div className="progress-row">
                            <span className="muted s">3/4 tasks completed</span>
                            <div className="track">
                                <div
                                    className="fill"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="chips">
                        <button className="chip">
                            <IonIcon icon={videocamOutline} />
                            <span>Live Classes</span>
                        </button>
                        <button className="chip">
                            <IonIcon icon={libraryOutline} />
                            <span>Video Library</span>
                        </button>
                        <button className="chip">
                            <IonIcon icon={pulseOutline} />
                            <span>Trackers</span>
                        </button>
                        <button className="chip">
                            <IonIcon icon={peopleOutline} />
                            <span>Community</span>
                        </button>
                    </div>

                    {/* Wellness Streak */}
                    <div className="streak card">
                        <div className="streak-left">
                            <div className="circle">
                                <IonIcon icon={leafOutline} />
                            </div>
                            <div className="streak-text">
                                <span className="muted">3-day wellness</span>
                                <span className="b">streak</span>
                            </div>
                        </div>
                        <div className="streak-right">
                            <div className="circle solid">
                                <IonIcon icon={flame} />
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
