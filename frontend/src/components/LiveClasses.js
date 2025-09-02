import React from "react";

const LiveClasses = () => {
    const classes = [
        {
            id: 1,
            time: "10:00 AM",
            title: "Prenatal Yoga",
            instructor: "Yamuna, Wombheal Instructor",
            action: "Join",
        },
        {
            id: 2,
            time: "11:00 AM",
            title: "Meditation",
            instructor: "Meghana, Garbhsamvaad Instructor",
            action: "Notify Me",
        },
        {
            id: 3,
            time: "1:00 PM",
            title: "Antenatal Class",
            instructor: "Neha, Wombheal Instructor",
            action: "Join",
        },
    ];

    return (
        <div className="live-classes">
            <div className="days-row">
                {["Sun", "Mon", "Tue", "Wed", "Thu"].map((day, idx) => (
                    <button
                        key={idx}
                        className={`day-btn ${day === "Tue" ? "active" : ""}`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="class-list">
                {classes.map((cls) => (
                    <div key={cls.id} className="class-card">
                        <div className="class-time">{cls.time}</div>
                        <div className="class-info">
                            <h3>{cls.title}</h3>
                            <p>{cls.instructor}</p>
                        </div>
                        <button className="class-action">{cls.action}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveClasses;
