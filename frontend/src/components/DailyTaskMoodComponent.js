import React, { useState } from "react";
import { IonPage, IonContent, IonIcon, IonInput } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
    happyOutline,
    sadOutline,
    heartOutline,
    sparklesOutline,
    ribbonOutline,
    close,
} from "ionicons/icons";

export default function DailyTaskMoodComponent() {
    const history = useHistory();
    const handleGoHomePage = () => history.goBack();

    const moods = [
        { id: "happy", label: "Happy", icon: happyOutline },
        { id: "calm", label: "Calm", icon: heartOutline },
        { id: "energetic", label: "Energetic", icon: sparklesOutline },
        { id: "tired", label: "Tired", icon: sadOutline },
        { id: "anxious", label: "Anxious", icon: sadOutline },
        { id: "neutral", label: "Neutral", icon: heartOutline },
    ];

    const [selectedMood, setSelectedMood] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        if (selectedMood) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);
        }
    };

    return (
        <IonPage>
            <IonContent
                fullscreen
                className="mood_main_container pregnant-dashboard task_section_container_wrap"
            >
                {/* HEADER */}
                <div className="header_for_task_section mood">
                    <h1>Your Mood</h1>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>

                {/* MOOD SELECTOR */}
                <div className="mood_selector_grid">
                    {moods.map((mood) => (
                        <div
                            key={mood.id}
                            className={`mood_card ${
                                selectedMood === mood.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedMood(mood.id)}
                        >
                            <IonIcon icon={mood.icon} className="mood_icon" />
                            <span>{mood.label}</span>
                        </div>
                    ))}
                </div>
                <div className={"mood_tracker_bottom_cont"}>
                    {/* OPTIONAL TEXT INPUT */}
                    <div className="mood_text_input">
                         <textarea cols={1}
                                   className={"samvaad_text_input_area"}
                                   placeholder={"Write your feelings (optional)"}
                         />
                    </div>

                    {/* SAVE BUTTON */}
                    <button
                        className="save_mood_button"
                        type="button"
                        onClick={handleSave}
                        disabled={!selectedMood}
                    >
                        Mark Done
                    </button>

                    {/* SUCCESS STATE */}
                    <div className="success_state samvaad_bottom_text">
                        <IonIcon icon={heartOutline} className="success_icon" />
                        <p>
                            Beautiful! Acknowledging your emotions helps your journey 💖
                        </p>
                    </div>

                    {/* STREAK TRACKER */}
                    <div className="samvaad_bottom_streek_section mood">
                        <IonIcon icon={ribbonOutline} className="streak-icon" />
                        <span className="streak-text">Day 4 of 7 Mood Streak</span>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
