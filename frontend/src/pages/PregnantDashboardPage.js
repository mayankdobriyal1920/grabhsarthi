import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import {
    leafOutline,
    flame
} from "ionicons/icons";
import {_babyWeeklyGrowthContentSvg} from "../apiHelper/CommonHelper";
import {useHistory} from "react-router-dom";
import PregnantTTCComponentDailyTaskComponent from "../components/PregnantTTCComponentDailyTaskComponent";
import PregnantTTCQuickActionsComponent from "../components/PregnantTTCQuickActionsComponent";

export default function PregnantDashboardPage() {
    let currentWeek = 4;
    const history = useHistory();
    const goToPage = (page)=>{
        history.push(page)
    }
    return (
        <IonPage>
            <IonContent
                fullscreen
                className="dash --peach-bg pregnant-dashboard main-contant-page">
                <div className="dash-wrap pregnant-dashboard-wrap">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Namaste, Monika Ji!</h1>
                        <p>You’re in {_babyWeeklyGrowthContentSvg[currentWeek].week}</p>
                    </div>

                    <div className="baby-growth-card">
                        <h2>Hy Mama!</h2>
                        <div className="content">
                            <div className="baby-blob">
                                <img src={_babyWeeklyGrowthContentSvg[currentWeek].icon} alt={'baby'} className={"baby-svg"}/>
                            </div>
                            <div className="progress-box">
                                <div className={"progress_bar_div_with_percentage"}>
                                    <h3>{_babyWeeklyGrowthContentSvg[currentWeek].weight}</h3>
                                    <div className={"percentage_bar_main"}>
                                        <div style={{width: `${_babyWeeklyGrowthContentSvg[currentWeek].progress}%`}} className={"fill_bar"}></div>
                                    </div>
                                </div>
                                <span>Weekly progress {_babyWeeklyGrowthContentSvg[currentWeek].progress}%</span>
                            </div>
                        </div>
                        <p className="description">
                            {_babyWeeklyGrowthContentSvg[currentWeek].description}
                        </p>
                    </div>

                    {/* Daily Tasks */}
                    <PregnantTTCComponentDailyTaskComponent type={'pregnant'}/>
                    {/* Daily Tasks */}


                    {/* Quick actions */}
                    <PregnantTTCQuickActionsComponent/>
                    {/* Quick actions */}

                    {/* Wellness Streak */}
                    <div className="streak card">
                        <div className="streak-left">
                            <div className="circle">
                                <IonIcon icon={leafOutline}/>
                            </div>
                            <div className="streak-text">
                                <span className="muted">3 Of 7 day wellness</span>
                                <span className="b">streak</span>
                            </div>
                        </div>
                        <div className="streak-right">
                            <div className="circle solid">
                                <IonIcon icon={flame}/>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
