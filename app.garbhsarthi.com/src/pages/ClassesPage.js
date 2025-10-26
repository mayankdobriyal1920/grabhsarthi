import React, { useState } from "react";
import {
    IonPage,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from "@ionic/react";
import VideoLibrary from "../components/VideoLibrary";
import LiveClasses from "../components/LiveClasses";

const ClassesPage = ({renderHeaderPage}) => {
    const [tab, setTab] = useState("video");

    return (
        <IonPage>
            {/*/////// RENDER HEADER PART ////////*/}
            {renderHeaderPage && renderHeaderPage()}
            {/*/////// RENDER HEADER PART ////////*/}
            <IonContent fullscreen className="classes-page main-content-page">
                <div className="dash-wrap classes-page-dashboard">
                    <IonSegment
                        value={tab}
                        onIonChange={(e) => setTab(e.detail.value)}
                        className="classes-segment"
                    >
                        <IonSegmentButton value="video">
                            <IonLabel>Video Library</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="live">
                            <IonLabel>Live Classes</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                    <div className="classes-page-dashboard-inner">
                      {tab === "video" ? <VideoLibrary /> : <LiveClasses />}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ClassesPage;