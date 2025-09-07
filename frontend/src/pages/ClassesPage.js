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

const ClassesPage = () => {
    const [tab, setTab] = useState("video");

    return (
        <IonPage>
            <IonContent fullscreen className="classes-page main-content-page">
                <div className="dash-wrap classes-page-dashboard">
                    <div className="classes-header">
                        <h1>{tab === "video" ? "Video Library" : "Live Classes"}</h1>
                        <p className="page-subtitle">
                            {tab === "video"
                                ? "Access our curated collection of prenatal wellness videos"
                                : "Join live sessions with our expert instructors"}
                        </p>
                    </div>

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

                    {tab === "video" ? <VideoLibrary /> : <LiveClasses />}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ClassesPage;