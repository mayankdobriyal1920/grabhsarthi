import React, {useState} from "react";
import prenatalImg from "../theme/img/classImg/prenatal-img.png";
import garbhsanskaarImg from "../theme/img/classImg/garbhsanskaar-img.png";
import pregnencyyogaImg from "../theme/img/classImg/pregnencyyoga-img.png";
import useStore from "../zustand/useStore";
import { useHistory } from "react-router-dom";
import { FacebookLoader } from "./FacebookLoader";
import moment from "moment-timezone";
import { actionToSaveSelectedLiveClassDataData } from "../apiHelper/CommonAction";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { useIonToast } from "@ionic/react";

const LiveClasses = () => {
    const { userAuthDetail, allScheduledLiveClassData } = useStore();
    const { userInfo } = userAuthDetail;
    const { loading, scheduledLiveClassData } = allScheduledLiveClassData;
    const [selectedLiveClassId, setSelectedLiveClassId] = useState(null);
    const history = useHistory();
    const [presentToast] = useIonToast();

    const toast = (message, color = "primary") =>
        presentToast({ message, duration: 1600, color, position: "top" });

    const getClassImage = (type) => {
        switch (type) {
            case "TTC":
                return pregnencyyogaImg;
            case "Garbh":
                return garbhsanskaarImg;
            case "Prenatal":
                return prenatalImg;
            case "Postnatal":
                return pregnencyyogaImg;
            default:
                return prenatalImg;
        }
    };

    const goToSubscriptionPage = () => {
        history.replace("/dashboard/subscription");
    };

    // Native app?
    const isMobile = () => Capacitor.isNativePlatform();

    // Copy link (with robust fallbacks) + Ionic toast
    const copyMeetingUrl = async (meeting_hash) => {
        if (!meeting_hash) {
            toast("Meeting link not available", "warning");
            return;
        }
        const meeting_link = `https://meet.garbhsarthi.com/class/join/${meeting_hash}`;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(meeting_link);
            } else {
                const el = document.createElement("textarea");
                el.value = meeting_link;
                el.setAttribute("readonly", "");
                el.style.position = "absolute";
                el.style.left = "-9999px";
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
            }
            toast("Meeting link copied", "success");
        } catch {
            // Final fallback: navigate so user can share from the address bar
            if (isMobile()) {
                try {
                    await Browser.open({ url: meeting_link });
                } catch {
                    window.location.href = meeting_link;
                }
            } else {
                window.location.href = meeting_link;
            }
        }
    };

    // Open link: native browser on mobile, new tab on web; safe fallbacks
    const openMeetingUrl = async (meeting_hash) => {
        if (!meeting_hash) {
            toast("Meeting link not available", "warning");
            return;
        }
        const meeting_link = `https://meet.garbhsarthi.com/class/join/${meeting_hash}`;

        if (isMobile()) {
            try {
                await Browser.open({ url: meeting_link });
            } catch {
                window.location.href = meeting_link;
            }
            return;
        }

        const win = window.open(meeting_link, "_blank", "noopener,noreferrer");
        if (!win) window.location.href = meeting_link;
    };

    const callFunctionToSaveSelectedData = (liveClassId) => {
        actionToSaveSelectedLiveClassDataData(liveClassId);
        toast("Class preference saved", "success");
    };

    // start → end (1 hour)
    const getClassWindow = (startTimeStr) => {
        const tz = moment.tz.guess();
        const now = moment.tz(tz);
        const start = moment.tz(
            `${now.format("YYYY-MM-DD")} ${startTimeStr}`,
            "YYYY-MM-DD HH:mm:ss",
            tz
        );
        const end = start.clone().add(1, "hour");
        return { now, start, end };
    };

    const renderActionButtons = (cls) => {
        const { now, start, end } = getClassWindow(cls?.start_time);

        if (now.isBefore(start)) {
            return (
                <div className="join_and_copy_button">
                    <button className="subscription_page_button_live_class">
                        Upcoming
                    </button>
                </div>
            );
        }

        if (now.isSameOrAfter(start) && now.isBefore(end)) {
            return (
                <div className="join_and_copy_button">
                    <button
                        onClick={() => copyMeetingUrl(cls?.meeting_hash)}
                        disabled={!cls?.meeting_hash}
                        className="subscription_page_button_live_class"
                    >
                        Copy Link
                    </button>
                    <button
                        onClick={() => openMeetingUrl(cls?.meeting_hash)}
                        disabled={!cls?.meeting_hash}
                        className="subscription_page_button_live_class"
                    >
                        Open Link
                    </button>
                </div>
            );
        }

        // Completed
        return (
            <div className="join_and_copy_button">
                <button className="subscription_page_button_live_class">
                    Completed
                </button>
            </div>
        );
    };

    return (
        <div className="live-classes">
            {userInfo?.active_subscription?.plan_type !== "PREMIUM" ? (
                <div className="plan_warning_header for_live_classes_page">
                    Click to upgrade subscription to access live classes
                    <button
                        onClick={goToSubscriptionPage}
                        className="subscription_page_button_live_class"
                        type="button"
                    >
                        Subscription
                    </button>
                </div>
            ) : (
                <>
                    {userInfo?.profile?.selected_live_class_id ? (
                        <>
                            {loading ? (
                                <div className="class-list">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="class-card">
                                            <FacebookLoader type="facebookStyle" item={1} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="class-list">
                                    {scheduledLiveClassData.map((cls) => (
                                        <React.Fragment key={cls?.id}>
                                            <div className="class-card select_class_li">
                                                <div className="class-card-inner">
                                                    <div className="class-img">
                                                        <img src={getClassImage(cls.type)} alt={cls.title} />
                                                    </div>
                                                    <div className="class-info">
                                                        <h3>{cls.title}</h3>
                                                        <p>{cls.trainer.name}</p>
                                                        <div className="class-time">
                                                            {moment(cls.start_time, "HH:mm:ss").format("hh:mm A")}
                                                        </div>
                                                        <div className="class-time-desc">Duration (1 Hour)</div>
                                                        <div className="class-time-desc-active-days">Mon,Tue,Thu,Fri</div>
                                                    </div>
                                                </div>
                                                <div className="class_live_description">{cls?.description}</div>
                                            </div>

                                            {renderActionButtons(cls)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="select_live_class_main_container">
                            {loading ? (
                                <div className="class-list">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="class-card">
                                            <FacebookLoader type="facebookStyle" item={1} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="class-list">
                                        {scheduledLiveClassData.map((cls) => (
                                            <div
                                                key={cls.id}
                                                className={`class-card select_class_li ${
                                                    selectedLiveClassId === cls?.id ? "active" : ""
                                                }`}
                                                onClick={() => setSelectedLiveClassId(cls.id)}
                                            >
                                                <div className="class-card-inner">
                                                    <div className="class-img">
                                                        <img src={getClassImage(cls.type)} alt={cls.title} />
                                                    </div>
                                                    <div className="class-info">
                                                        <h3>{cls.title}</h3>
                                                        <p>{cls.trainer.name}</p>
                                                        <div className="class-time">
                                                            {moment(cls.start_time, "HH:mm:ss").format("hh:mm A")}
                                                        </div>
                                                        <div className="class-time-desc">Duration (1 Hour)</div>
                                                        <div className="class-time-desc-active-days">Mon,Tue,Thu,Fri</div>
                                                    </div>
                                                </div>
                                                <div className="class_live_description">{cls?.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        disabled={!selectedLiveClassId}
                                        onClick={() => callFunctionToSaveSelectedData(selectedLiveClassId)}
                                        className="subscription_page_button_live_class"
                                        type="button"
                                    >
                                        Save Selected Class
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LiveClasses;
