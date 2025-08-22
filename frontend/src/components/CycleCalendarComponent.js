import React from "react";
import moment from "moment";

const CycleCalendarComponent = () => {
    const startOfWeek = moment().startOf("week").add(1, "day"); // Monday
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, "days") );

    const today = moment();
    const startOfMonth = today.clone().startOf("month");
    const endOfMonth = today.clone().endOf("month");

    // Create an array of all days in current month
    const daysInMonth = [];
    let day = startOfMonth.clone();

    while (day.isSameOrBefore(endOfMonth, "day")) {
        daysInMonth.push(day.clone());
        day.add(1, "day");
    }

    // Example fertile days (you can customize logic)
    const fertileStart = today.clone().date(10); // 10th of month
    const fertileEnd = today.clone().date(14);   // 14th of month

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
                    {daysInMonth.map((day, idx) => {
                        const isToday = moment().isSame(day, "day");
                        const isFertile =
                            day.isBetween(fertileStart, fertileEnd, "day", "[]");

                        return (
                            <span key={idx}
                                className={`${isToday ? "today" : ""} ${
                                    isFertile ? "active" : ""
                                }`}>
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
