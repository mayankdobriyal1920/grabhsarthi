import React, { useEffect, useState } from "react";
import {IonContent, IonHeader, IonIcon, IonModal, IonToolbar} from "@ionic/react";
import {
    happyOutline,
    sadOutline,
    heartOutline,
    sparklesOutline,
    close, timerOutline, fitnessOutline,
} from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {
    actionToSetCommonActionSheetPopupData,
    actionToUpsertDailyTaskProgress,
} from "../apiHelper/CommonAction";

export default function DailyTaskMoodComponent() {
    const { commonActionSheetPopupData, dailyTasksToday } = useStore();
    const { page } = commonActionSheetPopupData;

    const handleGoHomePage = () => actionToSetCommonActionSheetPopupData("");

    const moods = [
        { id: "happy", label: "Happy", icon: happyOutline },
        { id: "calm", label: "Calm", icon: heartOutline },
        { id: "energetic", label: "Energetic", icon: sparklesOutline },
        { id: "tired", label: "Tired", icon: sadOutline },
        { id: "anxious", label: "Anxious", icon: sadOutline },
        { id: "neutral", label: "Neutral", icon: heartOutline },
    ];

    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Prefill from today's saved mood (if any)
    useEffect(() => {
        if (page === "daily-task-mood") {
            const saved = dailyTasksToday?.data?.["MOOD"];
            const prevMood = saved?.details?.mood ?? null;
            const prevNote =
                typeof saved?.details?.note === "string" ? saved.details.note : "";
            setSelectedMood(prevMood);
            setNote(prevNote);
            setSaving(false);
            setShowSuccess(false);
        } else {
            setSelectedMood(null);
            setNote("");
            setSaving(false);
            setShowSuccess(false);
        }
    }, [page, dailyTasksToday]);

    // Native status bar styling
    useEffect(() => {
        if (Capacitor.isNativePlatform() && page === "daily-task-mood") {
            StatusBar.setBackgroundColor({ color: "#FFC107" }).then(() => {
                StatusBar.setStyle({ style: Style.Dark });
            });
            return () => {
                StatusBar.setBackgroundColor({ color: "#ffffff" }).then(() => {
                    StatusBar.setStyle({ style: Style.Light });
                });
            };
        }
    }, [page]);

    const handleSave = async () => {
        if (!selectedMood || saving) return;
        try {
            setSaving(true);
            await actionToUpsertDailyTaskProgress({
                task: "MOOD",
                progressPercent: 100, // marking done = 100%
                details: {
                    mood: selectedMood,
                    note: note?.trim() || "",
                    completed_at: new Date().toISOString(),
                },
            });
            setShowSuccess(true);
            // brief success flash then close
            setTimeout(() => {
                setShowSuccess(false);
                handleGoHomePage();
            }, 800);
        } catch (e) {
            console.error("Mood save failed", e);
            setSaving(false);
        }
    };

    return (
        <IonModal isOpen={page === "daily-task-mood"}>
            <IonHeader className={"main_header_in_task"}>
                <IonToolbar className={"main_toolbar_in_task header_for_task_section mood"}>
                    <div className="inner_container_main">
                        <div className={"main_toolbar_in_task_title"}>Your Mood</div>
                        <div
                            onClick={handleGoHomePage}
                            className="session-info-end-session duration count_sec"
                        >
                            <IonIcon icon={close} />
                            <span>End Session</span>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent
                fullscreen
                className="mood_main_container pregnant-dashboard task_section_container_wrap"
            >

                {/* MOOD SELECTOR */}
                <div className="mood_selector_grid">
                    {moods.map((mood) => (
                        <div
                            key={mood.id}
                            className={`mood_card ${selectedMood === mood.id ? "selected" : ""}`}
                            onClick={() => setSelectedMood(mood.id)}
                        >
                            <IonIcon icon={mood.icon} className="mood_icon" />
                            <span>{mood.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mood_tracker_bottom_cont">
                    {/* OPTIONAL TEXT INPUT */}
                    <div className="mood_text_input">
            <textarea
                cols={1}
                className={"samvaad_text_input_area"}
                placeholder={"Write your feelings (optional)"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={400}
            />
                    </div>

                    {/* SAVE BUTTON */}
                    <button
                        className="save_mood_button"
                        type="button"
                        onClick={handleSave}
                        disabled={!selectedMood || saving}
                    >
                        {saving ? "Saving..." : "Mark Done"}
                    </button>

                    {/* SUCCESS STATE */}
                    {showSuccess && (
                        <div className="success_state samvaad_bottom_text">
                            <IonIcon icon={heartOutline} className="success_icon" />
                            <p>Beautiful! Acknowledging your emotions helps your journey 💖</p>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonModal>
    );
}
