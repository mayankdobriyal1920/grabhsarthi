import React, {useEffect, useState} from "react";
import {
    IonPage,
    IonContent,
    IonIcon,
} from "@ionic/react";
import { chevronBack, chevronForward } from "ionicons/icons";
import {_babyWeeklyGrowthContentSvg, _getGestationalWeeksFromLMP} from "../apiHelper/CommonHelper";
import useStore from "../zustand/useStore";
import moment from "moment-timezone";
import {useLocation} from "react-router-dom";

export default function BabyTrackerPageForPregnantPage() {
    const { userAuthDetail } = useStore();
    const { userInfo } = userAuthDetail || {};
    const profile = userInfo?.profile || {}
    const [currentWeek, setCurrentWeek] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const lmpString = profile?.last_period_date ? moment(profile.last_period_date, "YYYY-MM-DD", true) : null;
        // Pick your LMP source (adjust these to your actual shape)
        const ga = _getGestationalWeeksFromLMP(lmpString, { maxWeeks: 40 });
        const currentWeekIndex = ga ? Math.max(0, Math.min(39, ga.weekNumber - 1)) : 0;
        setCurrentWeek(currentWeekIndex)
    }, [location]);

    const handleWeekChange = (dir) => {
        if (dir === "prev" && currentWeek > 4) setCurrentWeek(currentWeek - 1);
        if (dir === "next" && currentWeek < 40) setCurrentWeek(currentWeek + 1);
    };

    return (
        <IonPage>
            <IonContent
                fullscreen
                className="dash --peach-bg pregnant-dashboard main-content-page"
            >
                <div className="dash-wrap pregnant-dashboard-wrap baby-tracker-page-dashboard">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Hi Mama!</h1>
                    </div>
                    {/* Baby Growth Card */}
                    <div className="baby-growth-card">
                        <div className="content">
                            <div className="baby-blob">
                                <img
                                    src={_babyWeeklyGrowthContentSvg[currentWeek]?.icon}
                                    alt={"baby"}
                                    className={"baby-svg"}
                                />
                            </div>
                            <div className="progress-box">
                                <div className={"progress_bar_div_with_percentage"}>
                                    <h3>{_babyWeeklyGrowthContentSvg[currentWeek].weight}</h3>
                                    <div className={"percentage_bar_main"}>
                                        <div
                                            style={{
                                                width: `${_babyWeeklyGrowthContentSvg[currentWeek].progress}%`,
                                            }}
                                            className={"fill_bar"}
                                        ></div>
                                    </div>
                                </div>
                                <span>
                                  Weekly progress {_babyWeeklyGrowthContentSvg[currentWeek].progress}%
                                </span>
                            </div>
                        </div>
                        <p className="description">
                            {_babyWeeklyGrowthContentSvg[currentWeek].description}
                        </p>
                        <div className="header-nav">
                            <IonIcon icon={chevronBack} onClick={() => handleWeekChange("prev")} />
                            <h2>{currentWeek} Weeks Pregnant</h2>
                            <IonIcon icon={chevronForward} onClick={() => handleWeekChange("next")} />
                        </div>
                    </div>

                    <div className="stats-card baby_fruit_sized_card">
                        <div className={"baby-fruit-img_cont"}>
                            <img
                                src={_babyWeeklyGrowthContentSvg[currentWeek]?.fruit_icon_with_message?.icon}
                                alt={"baby"}
                                className={"baby-fruit-img"}
                            />
                        </div>
                        <div>
                            <p>{_babyWeeklyGrowthContentSvg[currentWeek]?.fruit_icon_with_message?.message}</p>
                        </div>
                    </div>

                    {/* Baby Stats */}
                    <div className="stats-card">
                        <h3>Baby’s Growth</h3>
                        <p>Height: {_babyWeeklyGrowthContentSvg[currentWeek].height}</p>
                        <p>Weight: {_babyWeeklyGrowthContentSvg[currentWeek].weight}</p>
                    </div>

                    {/* Weekly Insights */}
                    <div className="insights-card">
                        <h3>Weekly Insights</h3>
                        <ul>
                            {_babyWeeklyGrowthContentSvg[currentWeek].insights?.map((tip, i) => (
                                <li key={i}>{tip}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Self-care */}
                    <div className="selfcare-card">
                        <h3>What to Expect & Self-care</h3>
                        <p>{_babyWeeklyGrowthContentSvg[currentWeek].selfcare}</p>
                    </div>

                    {/* Checklist */}
                    <div className="checklist-card">
                        <h3>This Week’s To-Do</h3>
                        <ul>
                            {_babyWeeklyGrowthContentSvg[currentWeek].checklist?.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Wellness Reminders */}
                    <div className="reminder-card">
                        <h3>Wellness Reminder</h3>
                        <p>{_babyWeeklyGrowthContentSvg[currentWeek].reminder}</p>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
}
