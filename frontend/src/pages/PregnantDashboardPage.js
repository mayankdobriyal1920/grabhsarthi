import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { leafOutline, flame } from "ionicons/icons";
import {_babyWeeklyGrowthContentSvg, _getGestationalWeeksFromLMP} from "../apiHelper/CommonHelper";
import { useHistory } from "react-router-dom";
import PregnantTTCComponentDailyTaskComponent from "../components/PregnantTTCComponentDailyTaskComponent";
import PregnantTTCQuickActionsComponent from "../components/PregnantTTCQuickActionsComponent";
import useStore from "../zustand/useStore";
import moment from "moment/moment";

export default function PregnantDashboardPage() {
    const history = useHistory();
    const { userAuthDetail } = useStore();
    const { userInfo } = userAuthDetail || {};
    const profile = userInfo?.profile || {};
    const firstName = (profile?.full_name || "Friend").trim().split(/\s+/)[0];

    // Pick your LMP source (adjust these to your actual shape)
    const lmpString =
        profile?.last_period_date
            ? moment(profile.last_period_date, "YYYY-MM-DD", true)
            : null;

    const ga = _getGestationalWeeksFromLMP(lmpString, { maxWeeks: 40 });

    // Derive current week index for your content map/array.
    // If your _babyWeeklyGrowthContentSvg is 1-indexed by week number, adapt accordingly.
    // Assuming it's zero-indexed array where index 0 => week 1:
    const currentWeekIndex = ga ? Math.max(0, Math.min(39, ga.weekNumber - 1)) : 0;

    const weekContent = _babyWeeklyGrowthContentSvg[currentWeekIndex] || {
        week: "Week —",
        icon: "",
        weight: "",
        progress: 0,
        description: "",
    };

    // Progress as percent of 40 weeks (clamped)
    const progressPercent = ga ? Math.min(100, Math.round((ga.weekNumber / 40) * 100)) : 0;

    const goToPage = (page) => {
        history.replace(page);
    };

    return (
        <IonPage>
            <IonContent fullscreen className="dash --peach-bg pregnant-dashboard main-content-page">
                <div className="dash-wrap pregnant-dashboard-wrap">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Namaste, {firstName} Ji!</h1>

                        {/* If LMP missing, show a gentle prompt */}
                        {ga ? (
                            <p>
                                You’re in {weekContent.week}
                                {typeof ga.daysIntoWeek === "number" ? ` (+${ga.daysIntoWeek} day${ga.daysIntoWeek === 1 ? "" : "s"})` : ""}
                            </p>
                        ) : (
                            <p>
                                Add your last period date to see your pregnancy week.
                            </p>
                        )}
                    </div>

                    <div className="baby-growth-card" onClick={() => goToPage("/dashboard/tracker")}>
                        <h2>Hi Mama!</h2>
                        <div className="content">
                            <div className="baby-blob">
                                {weekContent.icon ? (
                                    <img src={weekContent.icon} alt={"baby"} className={"baby-svg"} />
                                ) : (
                                    <div className="baby-svg placeholder" />
                                )}
                            </div>
                            <div className="progress-box">
                                <div className={"progress_bar_div_with_percentage"}>
                                    <h3>{weekContent.weight}</h3>
                                    <div className={"percentage_bar_main"}>
                                        <div style={{ width: `${progressPercent}%` }} className={"fill_bar"}></div>
                                    </div>
                                </div>
                                <span>Weekly progress {progressPercent}%</span>
                            </div>
                        </div>
                        <p className="description">{weekContent.description}</p>
                    </div>

                    {/* Daily Tasks */}
                    <PregnantTTCComponentDailyTaskComponent type={"pregnant"} />
                    {/* Quick actions */}
                    <PregnantTTCQuickActionsComponent />

                    {/* Wellness Streak */}
                    <div className="streak card">
                        <div className="streak-left">
                            <div className="circle">
                                <IonIcon icon={leafOutline} />
                            </div>
                            <div className="streak-text">
                                <span className="muted">3 Of 7 day wellness</span>
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
