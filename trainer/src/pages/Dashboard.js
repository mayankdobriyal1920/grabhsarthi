import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getStoredAuth,
    fakeGetTrainerClasses,
    fakeLogout,
} from "../services/authService";

/**
 * Dashboard shows trainer classes and allows Join + Logout
 */
export default function Dashboard() {
    const navigate = useNavigate();
    const { trainer } = getStoredAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchClasses = async () => {
            setLoading(true);
            const data = await fakeGetTrainerClasses();
            if (mounted) {
                setClasses(data);
                setLoading(false);
            }
        };
        fetchClasses();
        return () => (mounted = false);
    }, []);

    const handleJoin = (meeting_link) => {
        if (!meeting_link) {
            alert("Meeting link not available for this class.");
            return;
        }

        // open in a new tab
        window.open(meeting_link, "_blank", "noopener,noreferrer");
    };

    const handleLogout = () => {
        fakeLogout();
        navigate("/", { replace: true });
    };

    return (
        <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h4 className="mb-0">Welcome, {trainer?.name || "Trainer"}</h4>
                    <div className="text-muted small">Trainer dashboard</div>
                </div>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/")}>
                        Home
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title">Your Scheduled Classes</h5>
                    <p className="text-muted small mb-3">
                        Only classes assigned to you are shown here. Click <strong>Join</strong> to open the meeting in a new tab.
                    </p>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-success" role="status" />
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="alert alert-info">You have no scheduled classes.</div>
                    ) : (
                        <div className="row g-3">
                            {classes.map((c) => (
                                <div className="col-md-6" key={c.id}>
                                    <div className="card h-100">
                                        <div className="card-body d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="mb-1">{c.title}</h6>
                                                    <div className="small text-muted">{c.start_time}</div>
                                                </div>
                                                <div>
                                                    <span className="badge bg-info text-dark">ID: {c.id}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto d-flex gap-2">
                                                <button className="btn btn-success" onClick={() => handleJoin(c.meeting_link)}>
                                                    Join
                                                </button>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        navigator.clipboard?.writeText(c.meeting_link || "");
                                                        alert("Meeting link copied to clipboard");
                                                    }}
                                                >
                                                    Copy Link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-muted small">
                Tip: Use the <strong>Join</strong> button to open meetings in your preferred browser app.
            </div>
        </div>
    );
}
