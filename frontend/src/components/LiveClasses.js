import React from "react";
import prenatalImg from "../theme/img/classImg/prenatal-img.png";
import garbhsanskaarImg from "../theme/img/classImg/garbhsanskaar-img.png";
import pregnencyyogaImg from "../theme/img/classImg/pregnencyyoga-img.png";

const LiveClasses = () => {
    const classes = [
        {
            id: 1,
            time: "10:00 AM",
            title: "Prenatal Yoga",
            image:prenatalImg,
            instructor: "Monika, Wombheal Instructor",
            action: "Join",
        },
        {
            id: 2,
            time: "11:00 AM",
            title: "Garbh Sanskaar",
            image:garbhsanskaarImg,
            instructor: "Monika, Garbhsanskaar Instructor",
            action: "Notify",
        },
        {
            id: 3,
            time: "1:00 PM",
            title: "Pregnancy Yoga",
            image:pregnencyyogaImg,
            instructor: "Monika, Wombheal Instructor",
            action: "Join",
        },
    ];

    return (
        <div className="live-classes">
            <div className="days-row">
                {["Sun", "Mon", "Tue", "Wed", "Thu"].map((day, idx) => (
                    <button
                        key={idx}
                        className={`day-btn ${day === "Tue" ? "active" : ""}`}>
                        {day}
                    </button>
                ))}
            </div>

            <div className="class-list">
                {classes.map((cls) => (
                    <div key={cls.id} className="class-card">
                        <div className="class-img">
                            <img src={cls.image}/>
                        </div>
                        <div className="class-info">
                            <h3>{cls.title}</h3>
                            <p>{cls.instructor}</p>
                            <div className="class-time">{cls.time}</div>
                        </div>
                        <button className="class-action">{cls.action}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveClasses;
