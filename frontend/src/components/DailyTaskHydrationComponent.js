import React, {useEffect, useMemo, useState} from "react";
import {IonContent, IonIcon, IonModal} from "@ionic/react";
import {add, close, fitnessOutline, timerOutline} from "ionicons/icons";
import hydrationImg from "../theme/img/hydration_bottal_img.png";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData, actionToUpsertDailyTaskProgress} from "../apiHelper/CommonAction";

const GLASS_ML = 250;         // 🥤 per glass
const TARGET_GLASSES = 8;     // 🎯 daily goal
const TARGET_ML = TARGET_GLASSES * GLASS_ML;

export default function DailyTaskHydrationComponent() {
    const {commonActionSheetPopupData, dailyTasksToday} = useStore();
    const {page} = commonActionSheetPopupData;

    const [glasses, setGlasses] = useState(0);
    const [saving, setSaving] = useState(false);

    const ml = useMemo(() => glasses * GLASS_ML, [glasses]);
    const percent = useMemo(
        () => Math.min(100, Math.round((ml / TARGET_ML) * 100)),
        [ml]
    );

    const handleGoHomePage = () => {
        actionToSetCommonActionSheetPopupData("");
    };

    // Prefill from saved progress (today)
    useEffect(() => {
        if (page === "daily-task-hydration") {
            const saved = dailyTasksToday?.data?.["HYDRATION"];
            const savedGlasses =
                Number(saved?.details?.glasses ?? (saved?.details?.water_ml ? Math.floor(Number(saved.details.water_ml) / GLASS_ML) : 0)) || 0;
            setGlasses(Math.max(0, Math.min(TARGET_GLASSES, savedGlasses)));
            setSaving(false);
        } else {
            setGlasses(0);
            setSaving(false);
        }
    }, [page, dailyTasksToday]);

    // Native status bar styling
    useEffect(() => {
        if (Capacitor.isNativePlatform() && page === "daily-task-hydration") {
            StatusBar.setBackgroundColor({ color: "#8cc7d5" }).then(() => {
                StatusBar.setStyle({ style: Style.Dark });
            });
            return () => {
                StatusBar.setBackgroundColor({ color: "#ffffff" }).then(() => {
                    StatusBar.setStyle({ style: Style.Light });
                });
            };
        }
    }, [page]);

    const persist = async (newGlasses) => {
        const water_ml = newGlasses * GLASS_ML;
        const pp = Math.min(100, Math.round((water_ml / TARGET_ML) * 100));
        try {
            setSaving(true);
            await actionToUpsertDailyTaskProgress({
                task: "HYDRATION",
                progressPercent: pp,
                details: {
                    glasses: newGlasses,
                    water_ml,
                    target_glasses: TARGET_GLASSES,
                    target_ml: TARGET_ML,
                    // completed_at only when hit 100
                    completed_at: pp >= 100 ? new Date().toISOString() : null,
                },
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddGlass = async () => {
        if (glasses >= TARGET_GLASSES) return; // already complete
        const next = Math.min(TARGET_GLASSES, glasses + 1);
        setGlasses(next);
        await persist(next);
        // Optionally auto-close when goal reached:
        // if (next === TARGET_GLASSES) handleGoHomePage();
    };

    // Optional: allow a remove (long-press UI in future; simple button here)
    const handleRemoveGlass = async () => {
        if (glasses <= 0) return;
        const next = Math.max(0, glasses - 1);
        setGlasses(next);
        await persist(next);
    };

    return (
        <IonModal isOpen={page === "daily-task-hydration"}>
            <IonContent
                fullscreen
                scrollEvents={true}
                className="pregnant-dashboard task_section_container_wrap hydration_main_container"
            >
                <div className="header_for_task_section hydration">
                    <h1>{`Today's`} Hydration</h1>
                    <div className="session-info">
                        <div className="duration time_sec_c">
                            <IonIcon icon={timerOutline}/>
                            <span>{glasses} of {TARGET_GLASSES} Glasses</span>
                        </div>
                        <div className="duration count_sec">
                            <IonIcon icon={fitnessOutline}/>
                            <span>{percent}% complete</span>
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close}/>
                        <span>End Session</span>
                    </div>
                </div>

                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className="hydrated_section_image">
                        <img src={hydrationImg} alt="hydration"/>
                    </div>

                    <div className="session_start_stop_skin_button" style={{ gap: 12 }}>
                        <button
                            className="save_samvaad_button add_glass_hydration_button"
                            type="button"
                            onClick={handleAddGlass}
                            disabled={saving || glasses >= TARGET_GLASSES}
                        >
                            <IonIcon icon={add}/> {glasses > 0 ? 'Add' : 'Add Glass'}
                        </button>

                        {/* Optional: show remove when there is progress */}
                        {glasses > 0 && (
                            <button
                                className="button_in_time_y_task_skip_task"
                                type="button"
                                onClick={handleRemoveGlass}
                                disabled={saving}
                                style={{ minWidth: 120 }}
                            >
                                − Remove
                            </button>
                        )}
                    </div>

                    <div className="samvaad_bottom_text" style={{ marginTop: 12 }}>
                        Great job! Every sip nourishes you and your baby 💖
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
