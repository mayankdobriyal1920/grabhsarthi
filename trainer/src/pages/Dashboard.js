import React, { useEffect } from "react";
import useStore from "../trainerStore/trainerStore";
import moment from "moment-timezone";
import { actionToGetAllScheduledLiveClassByTrainerId } from "../apiHelper/TrainerCommonAction";

/**
 * Dashboard shows trainer classes and allows Join + Logout
 */
export default function Dashboard() {
    const { userAuthDetail, allScheduledLiveClassData } = useStore();
    const { loading, scheduledLiveClassData } = allScheduledLiveClassData;
    const { userInfo } = userAuthDetail;

    useEffect(() => {
        actionToGetAllScheduledLiveClassByTrainerId();
    }, []);

    // Build a meeting URL. Prefer a full link from backend if available.
    const buildMeetingUrl = (c) => {
        const hash = c.meeting_hash;
        if (!hash) return null;
        return `https://meet.garbhsarthi.com/class/${hash}`;
    }

    const copyLink = async (c) => {
        const url = buildMeetingUrl(c);
        if (!url) {
            alert("Meeting link not available for this class.");
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const el = document.createElement("textarea");
                el.value = url;
                el.setAttribute("readonly", "");
                el.style.position = "absolute";
                el.style.left = "-9999px";
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
            }
            alert("Meeting link copied to clipboard");
        } catch {
            // Last-resort fallback: navigate so user can share from the address bar
            window.location.href = url;
        }
    };

    const openLink = (c) => {
        const url = buildMeetingUrl(c);
        if (!url) {
            alert("Meeting link not available for this class.");
            return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
    };

    // Compute today's class window (1 hour from start)
    const getClassWindow = (startTimeStr) => {
        const tz = moment.tz.guess();
        const now = moment.tz(tz);
        const start = moment.tz(`${now.format("YYYY-MM-DD")} ${startTimeStr}`, "YYYY-MM-DD HH:mm:ss", tz);
        const end = start.clone().add(1, "hour");
        return { now, start, end };
    };

    const renderActions = (c) => {
        const { now, start, end } = getClassWindow(c.start_time);

        if (now.isBefore(start)) {
            // Upcoming
            return (
                <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-secondary">
                        Upcoming
                    </button>
                </div>
            );
        }

        if (now.isSameOrAfter(start) && now.isBefore(end)) {
            // Ongoing
            return (
                <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-success" onClick={() => openLink(c)} disabled={!buildMeetingUrl(c)}>
                        Open Link
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => copyLink(c)}>
                        Copy Link
                    </button>
                </div>
            );
        }

        return (
            <div className="mt-auto d-flex gap-2">
                <button className="btn btn-outline-secondary">
                    Completed
                </button>
            </div>
        );
    };


    return (
        <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h4 className="mb-0">Welcome, {userInfo?.name?.split(" ")?.[0] || "Trainer"}</h4>
                    <div className="text-muted small">Trainer dashboard</div>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Your Scheduled Classes</h5>
                    <p className="text-muted small mb-3">
                        Only classes assigned to you are shown here. When the class is ongoing, use <strong>Open</strong> or{" "}
                        <strong>Copy Link</strong>.
                    </p>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-success" role="status" />
                        </div>
                    ) : scheduledLiveClassData.length === 0 ? (
                        <div className="alert alert-info">You have no scheduled classes.</div>
                    ) : (
                        <div className="row g-3">
                            {scheduledLiveClassData.map((c) => {
                                const prettyTime = moment(c.start_time, "HH:mm:ss").format("hh:mm a");
                                return (
                                    <div className="col-md-6" key={c.id}>
                                        <div className="card h-100">
                                            <div className="card-body d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1">{c.title}</h6>
                                                        <div className="small text-muted">{prettyTime}</div>
                                                    </div>
                                                    <div>
                                                        <span className="badge bg-info text-dark">ID: {c.id}</span>
                                                    </div>
                                                </div>

                                                {renderActions(c)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-muted small">
                Tip: During the class window, <strong>Join</strong> opens the meeting in your browser/app. You can also{" "}
                <strong>Copy Link</strong> to share quickly.
            </div>
        </div>
    );
}
