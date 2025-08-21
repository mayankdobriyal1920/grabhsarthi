import React from "react";
import moment from "moment";

const CycleCalendarComponent = () => {
    // Get start of current week (Monday)
    const startOfWeek = moment().startOf("week").add(1, "day"); // Monday
    const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
        startOfWeek.clone().add(i, "days")
    );

    // Example fertile days (say day 5–7 of current week)
    const fertileStart = startOfWeek.clone().add(4, "days"); // 5th day
    const fertileEnd = startOfWeek.clone().add(6, "days");   // 7th day

    return (
        <div className="cycle-card">
            <div className="dash-card-head">
                <h3>Cycle Calendar</h3>
            </div>
            <div className="dash-card-body">
                {/* Week Days (Mon–Sun) */}
                <div className="calendar-strip">
                    {daysOfWeek.map((day, idx) => (
                        <span key={idx}>{day.format("dd").charAt(0)}</span>
                    ))}
                </div>

                {/* Dates */}
                <div className="calendar-dates">
                    {daysOfWeek.map((day, idx) => {
                        const isToday = moment().isSame(day, "day");
                        const isFertile =
                            day.isBetween(fertileStart, fertileEnd, "day", "[]");

                        return (
                            <span
                                key={idx}
                                className={`${isToday ? "today" : ""} ${
                                    isFertile ? "active" : ""
                                }`}
                            >
                {day.date()}
              </span>
                        );
                    })}
                </div>

                <p className="status-text">Likely Fertile</p>
            </div>
        </div>
    );
};

export default CycleCalendarComponent;
