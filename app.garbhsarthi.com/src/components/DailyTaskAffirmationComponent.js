import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonModal } from "@ionic/react";
import { close, heartOutline, sparklesOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {
    actionToSetCommonActionSheetPopupData,
    actionToUpsertDailyTaskProgress,
} from "../apiHelper/CommonAction";

const AFFIRMATIONS = [
    { text: "My body is wise, strong, and ready.", source: "default" },
    { text: "I welcome new life with love and patience.", source: "default" },
    { text: "I trust the timing of my journey.", source: "default" },
    { text: "Every cell in my body supports fertility and balance.", source: "default" },
    { text: "I choose hope, faith, and gentle care for myself.", source: "default" },
];

export default function DailyTaskAffirmationComponent() {
    const { commonActionSheetPopupData, dailyTasksToday } = useStore();
    const { page } = commonActionSheetPopupData;

    const handleGoHomePage = () => actionToSetCommonActionSheetPopupData("");

    const [text, setText] = useState("");
    const [saving, setSaving] = useState(false);
    const [index, setIndex] = useState(0);

    // pick a stable suggestion per day (changes daily but consistent across opens)
    const suggestion = useMemo(() => AFFIRMATIONS[index % AFFIRMATIONS.length], [index]);

    useEffect(() => {
        if (page === "daily-task-affirmation") {
            // Prefill from saved progress for today (if any)
            const saved = dailyTasksToday?.data?.["AFFIRMATION"];
            const prevText =
                (typeof saved?.details?.text === "string" && saved.details.text) || "";
            setText(prevText || suggestion.text);
            setSaving(false);

            // Status bar styling
            if (Capacitor.isNativePlatform()) {
                StatusBar.setBackgroundColor({ color: "#ff9380" }).then(() => {
                    StatusBar.setStyle({ style: Style.Dark });
                });
            }
        } else {
            setText("");
            setSaving(false);
            if (Capacitor.isNativePlatform()) {
                StatusBar.setBackgroundColor({ color: "#ffffff" }).then(() => {
                    StatusBar.setStyle({ style: Style.Light });
                });
            }
        }
    }, [page, dailyTasksToday]);

    const cycleSuggestion = () => {
        setIndex((i) => i + 1);
        setText(AFFIRMATIONS[(index + 1) % AFFIRMATIONS.length].text);
    };

    const useSuggestion = () => setText(suggestion.text);

    const handleSave = async () => {
        if (saving) return;
        const finalText = text?.trim() || suggestion.text;

        try {
            setSaving(true);
            await actionToUpsertDailyTaskProgress({
                task: "AFFIRMATION",
                progressPercent: 100,
                details: {
                    text: finalText,
                    source: "user", // or "default" if unchanged
                    completed_at: new Date().toISOString(),
                },
            });
            handleGoHomePage();
        } catch (e) {
            console.error("Affirmation save failed", e);
            setSaving(false);
        }
    };

    return (
        <IonModal isOpen={page === "daily-task-affirmation"}>
            <IonContent
                fullscreen
                scrollEvents={true}
                className="pregnant-dashboard task_section_container_wrap affirmation_main_container samvaad_main_container"
            >
                {/* Header */}
                <div className="header_for_task_section affirmation samvaad">
                    <h1>Affirmation</h1>
                    <div
                        onClick={handleGoHomePage}
                        className="session-info-end-session duration count_sec"
                    >
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>

                {/* Body */}
                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className="card tasks card_for_affirmation">
                        <div className="samvaad_inner_card">
                            <div className="sanvaad_sweet_msz" style={{ marginBottom: 8 }}>
                                Speak your intention with love
                            </div>

                            {/* Suggested affirmation */}
                            <div className="mantra_message_text" style={{ marginBottom: 12 }}>
                                <IonIcon icon={sparklesOutline} style={{ marginRight: 6 }} />
                                <strong>Suggestion:</strong> {suggestion.text}
                            </div>

                            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                <button
                                    type="button"
                                    className="button_in_time_y_task"
                                    onClick={useSuggestion}
                                >
                                    Use this
                                </button>
                                <button
                                    type="button"
                                    className="button_in_time_y_task_skip_task"
                                    onClick={cycleSuggestion}
                                >
                                    Next suggestion
                                </button>
                            </div>

                            {/* Input (optional edit) */}
                            <textarea
                                cols={1}
                                className="samvaad_text_input_area"
                                placeholder="Write or edit your affirmation (optional)"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={200}
                            />

                            {/* Save */}
                            <button
                                className="save_samvaad_button"
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                style={{ marginTop: 12 }}
                            >
                                {saving ? "Saving..." : "Mark Done"}
                            </button>
                        </div>
                    </div>

                    <div className="samvaad_bottom_text">
                        <IonIcon icon={heartOutline} style={{ marginRight: 6 }} />
                        Gentle words today, stronger hope tomorrow 💖
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
