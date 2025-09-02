import React from "react";
import { IonIcon } from "@ionic/react";
import { playCircle } from "ionicons/icons";

const VideoLibrary = () => {
    const videos = [
        {
            id: 1,
            title: "Prenatal Yoga",
            category: "Yoga",
            thumbnail:
                "https://images.pexels.com/photos/396133/pexels-photo-396133.jpeg",
        },
        {
            id: 2,
            title: "Mantra Chanting",
            category: "Wellness",
            thumbnail:
                "https://images.pexels.com/photos/356372/pexels-photo-356372.jpeg",
        },
    ];

    return (
        <div className="video-library">
            <div className="filter-bar">
                <button className="filter-btn">1st Trimester ⌄</button>
                <button className="filter-btn">Category ⌄</button>
            </div>

            <div className="video-list">
                {videos.map((video) => (
                    <div key={video.id} className="video-card">
                        <img src={video.thumbnail} alt={video.title} />
                        <div className="play-overlay">
                            <IonIcon icon={playCircle} className="play-icon" />
                        </div>
                        <div className="video-info">
                            <h3>{video.title}</h3>
                            <span className="tag">{video.category}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoLibrary;
