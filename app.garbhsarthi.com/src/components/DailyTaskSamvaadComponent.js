import React, {useEffect, useState} from "react";
import {IonContent, IonHeader, IonIcon, IonModal, IonToolbar} from "@ionic/react";
import pregSamvaadImg from "../theme/img/preg_samvaad.png";
import {close} from "ionicons/icons";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData, actionToUpsertDailyTaskProgress} from "../apiHelper/CommonAction";

export default function DailyTaskSamvaadComponent() {
    const [babySamvaadText, setBabySamvaadText] = useState("");
    const [saving, setSaving] = useState(false);

    const { commonActionSheetPopupData, dailyTasksToday } = useStore();
    const { page } = commonActionSheetPopupData;

    const handleGoHomePage = () => actionToSetCommonActionSheetPopupData("");

    // Prefill from saved progress (today)
    useEffect(() => {
        if (page === "daily-task-samvaad") {
            const saved = dailyTasksToday?.data?.["SAMVAAD"];
            const prevMsg =
                (typeof saved?.details?.message === "string" && saved.details.message) ||
                (typeof saved?.details === "object" && saved.details?.message) ||
                "";
            setBabySamvaadText(prevMsg);
        } else {
            // reset when modal closes
            setBabySamvaadText("");
            setSaving(false);
        }
    }, [page, dailyTasksToday]);

    // Native status bar styling
    useEffect(() => {
        if (Capacitor.isNativePlatform() && page === "daily-task-samvaad") {
            StatusBar.setBackgroundColor({ color: "#ff9380" }).then(() => {
                StatusBar.setStyle({ style: Style.Dark });
            });
            return () => {
                StatusBar.setBackgroundColor({ color: "#ffffff" }).then(() => {
                    StatusBar.setStyle({ style: Style.Light });
                });
            };
        }
    }, [page]);

    const handleComplete = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const message = babySamvaadText?.trim() || ""; // optional message
            await actionToUpsertDailyTaskProgress({
                task: "SAMVAAD",
                progressPercent: 100,
                details: {
                    message,
                    chars: message.length,
                    completed_at: new Date().toISOString(),
                },
            });
            handleGoHomePage();
        } catch (e) {
            console.error("SAMVAAD save failed", e);
            setSaving(false);
        }
    };

    return (
        <IonModal isOpen={page === "daily-task-samvaad"}>
            <IonHeader className={"main_header_in_task"}>
                <IonToolbar className={"main_toolbar_in_task header_for_task_section samvaad"}>
                    <div className="inner_container_main">
                        <div className={"main_toolbar_in_task_title"}>Garbh Samvaad</div>
                        <div className="session-info-text-header">
                            <div className="duration time_sec_c">
                                {"Let's"} Strengthen your bond today
                            </div>
                        </div>
                        <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                            <IonIcon icon={close} />
                            <span>End Session</span>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent
                fullscreen
                scrollEvents={true}
                className="pregnant-dashboard task_section_container_wrap samvaad_main_container"
            >

                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className={"card tasks card_for_garbh_samvaad"}>
                        <div className={"samvaad_inner_card"}>
                            <div className={"samvaad_inner_img_cont"}>
                                <img alt={"samvaad"} src={pregSamvaadImg} />
                            </div>
                            <div className={"sanvaad_sweet_msz"}>Share one sweet message with your baby</div>

                            <textarea
                                cols={1}
                                className={"samvaad_text_input_area"}
                                placeholder={"Write your message here (optional)"}
                                onChange={(e) => setBabySamvaadText(e.target.value)}
                                value={babySamvaadText}
                                maxLength={400} // safe guard
                            />

                            <button
                                className={"save_samvaad_button"}
                                type="button"
                                onClick={handleComplete}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Press to complete task"}
                            </button>
                        </div>
                    </div>

                    <div className={"samvaad_bottom_text"}>
                        Beautiful! Every word of love nourishes your baby 💖
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
