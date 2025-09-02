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

            <style>
                {`
          .classes-page-dashboard {
            background: #ffffff;
            padding: 0 16px 24px 16px;
          }

          .classes-header {
            text-align: center;
            margin-bottom: 24px;
          }
          
          .classes-header h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--gs-pink);
            margin-bottom: 8px;
          }
          
          .page-subtitle {
            color: #666;
            font-size: 14px;
            margin: 0;
            line-height: 1.4;
          }

          /* Segment Tabs */
          .classes-segment {
            margin: 0 auto 28px auto;
            width: 90%;
            --background: #f8f8f8;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          }
          
          .classes-segment ion-segment-button {
            --color: #888;
            --color-checked: #fff;
            --background-checked: var(--gs-pink);
            --indicator-color: var(--gs-pink);
            --indicator-box-shadow: none;
            border-radius: 10px;
            font-weight: 600;
            --padding-top: 8px;
            --padding-bottom: 8px;
            min-height: 40px;
          }

          /* Video Library */
          .video-library .filter-bar {
            display: flex;
            justify-content: flex-start;
            gap: 12px;
            margin-bottom: 20px;
            overflow-x: auto;
            padding-bottom: 4px;
          }
          
          .video-library .filter-bar::-webkit-scrollbar {
            display: none;
          }
          
          .video-library .filter-btn {
            padding: 10px 16px;
            border: 1px solid #e6e6e6;
            border-radius: 20px;
            background: #fff;
            font-size: 14px;
            font-weight: 500;
            color: #555;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;
          }
          
          .video-library .filter-btn:active {
            background: #f9f9f9;
          }
          
          .video-library .video-card {
            position: relative;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          
          .video-library .video-card:active {
            transform: translateY(2px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }
          
          .video-library .video-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          
          .video-library .play-overlay {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
          }
          
          .video-library .play-icon {
            font-size: 48px;
            color: #fff;
            filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.4));
          }
          
          .video-library .video-info {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
          }
          
          .video-library .video-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
            color: #333;
          }
          
          .video-library .video-info .tag {
            font-size: 12px;
            background: var(--gs-pink);
            color: #fff;
            padding: 5px 12px;
            border-radius: 12px;
            font-weight: 500;
          }

          /* Live Classes */
          .live-classes .days-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            gap: 8px;
          }
          
          .live-classes .day-btn {
            flex: 1;
            padding: 10px 0;
            border-radius: 12px;
            border: 1px solid #e6e6e6;
            background: #fff;
            font-size: 14px;
            font-weight: 500;
            color: #666;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;
          }
          
          .live-classes .day-btn.active {
            background: var(--gs-pink);
            color: #fff;
            border-color: var(--gs-pink);
            box-shadow: 0 3px 8px rgba(var(--gs-pink-rgb), 0.3);
          }
          
          .live-classes .class-card {
            display: flex;
            align-items: center;
            background: #fff;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0f0f0;
          }
          
          .live-classes .class-time {
            font-size: 15px;
            font-weight: 700;
            color: var(--gs-pink);
            width: 80px;
            flex-shrink: 0;
          }
          
          .live-classes .class-info {
            flex: 1;
            padding-right: 12px;
          }
          
          .live-classes .class-info h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
          
          .live-classes .class-info p {
            margin: 0;
            font-size: 13px;
            color: #666;
            line-height: 1.4;
          }
          
          .live-classes .class-action {
            background: var(--gs-pink);
            color: #fff;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(var(--gs-pink-rgb), 0.3);
            transition: all 0.2s ease;
          }
          
          .live-classes .class-action:active {
            transform: translateY(1px);
            box-shadow: 0 1px 3px rgba(var(--gs-pink-rgb), 0.3);
          }
        `}
            </style>
        </IonPage>
    );
};

export default ClassesPage;