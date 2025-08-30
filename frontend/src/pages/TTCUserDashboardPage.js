import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import {
    videocamOutline,
    libraryOutline,
    pulseOutline,
    peopleOutline,
    leafOutline,
    flame,
} from "ionicons/icons";
import CycleCalendarComponent from "../components/CycleCalendarComponent";
import {useHistory} from "react-router-dom";
import PregnantTTCComponentDailyTaskComponent from "../components/PregnantTTCComponentDailyTaskComponent";
import PregnantTTCQuickActionsComponent from "../components/PregnantTTCQuickActionsComponent";

export default function TTCUserDashboardPage() {
    const history = useHistory();
    const goToPage = (page)=>{
        history.push(page)
    }

    return (
        <IonPage>
            <IonContent
                fullscreen
                className="dash --peach-bg pregnant-dashboard ttc-dashboard main-contant-page">
                <div className="dash-wrap pregnant-dashboard-wrap">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Namaste, Monika Ji!</h1>
                        <p>Let’s track your cycle</p>
                    </div>

                    {/* Baby Growth Snapshot */}
                    <CycleCalendarComponent/>

                    {/* Daily Tasks */}
                    <PregnantTTCComponentDailyTaskComponent type={'ttc'}/>
                    {/* Daily Tasks */}


                    {/* Quick actions */}
                    <PregnantTTCQuickActionsComponent/>
                    {/* Quick actions */}

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
