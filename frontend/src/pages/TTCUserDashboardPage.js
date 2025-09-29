import React from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { leafOutline, flame } from "ionicons/icons";
import moment from "moment";
import useStore from "../zustand/useStore";

import CycleCalendarComponent from "../components/CycleCalendarComponent";
import PregnantTTCComponentDailyTaskComponent from "../components/PregnantTTCComponentDailyTaskComponent";
import PregnantTTCQuickActionsComponent from "../components/PregnantTTCQuickActionsComponent";

export default function TTCUserDashboardPage() {
    const { userAuthDetail } = useStore();
    const { userInfo } = userAuthDetail || {};

    const profile = userInfo?.profile || {};
    const firstName = (profile?.full_name || "Friend").trim().split(/\s+/)[0];

    // Derive props for calendar from profile
    const lmp = profile?.last_period_date
        ? moment(profile.last_period_date, "YYYY-MM-DD", true)
        : null;

    const cycleLength = Number.isFinite(Number(profile?.cycle_length))
        ? Number(profile.cycle_length)
        : undefined;

    return (
        <IonPage>
            <IonContent
                fullscreen
                className="dash --peach-bg pregnant-dashboard ttc-dashboard main-content-page"
            >
                <div className="dash-wrap pregnant-dashboard-wrap">
                    {/* Greeting */}
                    <div className="greet">
                        <h1>Namaste, {firstName} Ji!</h1>
                        <p>Let’s track your cycle</p>
                    </div>

                    {/* Cycle Calendar (clickable to open tracker) */}
                    <CycleCalendarComponent
                        isDashboardPage={true}
                        profile={profile} // carries role (2/3)
                        lastPeriodDateStr={lmp?.isValid() ? lmp.format("YYYY-MM-DD") : undefined}
                        cycleLength={cycleLength}
                        timezone="Asia/Kolkata"
                        periodLengthDays={profile?.period_length}
                        lutealPhaseDays={14}
                    />

                    {/* Daily Tasks */}
                    <PregnantTTCComponentDailyTaskComponent type="ttc" />

                    {/* Quick actions */}
                    <PregnantTTCQuickActionsComponent />
                </div>
            </IonContent>
        </IonPage>
    );
}
