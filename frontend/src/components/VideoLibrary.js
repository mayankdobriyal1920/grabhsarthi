import React from "react";
import { IonIcon } from "@ionic/react";
import {chevronDown, playCircle} from "ionicons/icons";
import yogaVid1 from "../theme/img/yogaVidImg/yoga_vid_img_1.png";
import yogaVid2 from "../theme/img/yogaVidImg/yoga_vid_img_2.png";
import yogaVid3 from "../theme/img/yogaVidImg/yoga_vid_img_3.png";
import yogaVid4 from "../theme/img/yogaVidImg/yoga_vid_img_4.png";

const VideoLibrary = () => {
    const videos = [
        {
            id: 1,
            title: "Gentle Prenatal Yoga for Beginners",
            description: "A calming class designed for first-time moms. Focuses on breathing, gentle stretches, and safe movements to release tension.",
            category: "Yoga",
            thumbnail:yogaVid1,
        },
        {
            id: 2,
            title: "Second Trimester Energy Boost",
            description: "This session improves flexibility and energy levels. Includes safe poses for back pain relief and better posture.",
            category: "Wellness",
            thumbnail:yogaVid2,
        },
        {
            id: 3,
            title: "Prenatal Yoga for Better Sleep",
            description: "Gentle nighttime yoga routine to relax your body, reduce stress, and prepare you for restful sleep during pregnancy.",
            category: "Wellness",
            thumbnail:yogaVid3,
        },
        {
            id: 4,
            title: "Labor Preparation Yoga",
            description: "Focuses on hip-opening poses, breathwork, and relaxation techniques to prepare your body for a smoother labor.",
            category: "Wellness",
            thumbnail:yogaVid4,
        }
    ];

    return (
        <div className="video-library">
            <div className="filter-bar">
                <button className="filter-btn">1st Trimester <IonIcon icon={chevronDown}/></button>
                <button className="filter-btn">Category <IonIcon icon={chevronDown}/></button>
            </div>

            <div className="video-list">
                {videos.map((video) => (
                    <div key={video.id} className="video-card">
                        <div className={"video_student_lib_section"}>
                            <img src={video.thumbnail} alt={video.title} />
                            <div className="play-overlay">
                                <IonIcon icon={playCircle} className="play-icon" />
                            </div>
                        </div>
                        <div className="video-info">
                            <div className="video-info-bottom-card">
                                <h3>{video.title}</h3>
                                <span className="tag">{video.category}</span>
                            </div>
                            <div className={"vid_description"}>{video?.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoLibrary;
