// src/components/CycleCalendarComponent.js
import React, { useMemo } from "react";
import moment from "moment-timezone";

const DEFAULTS = {
    periodLengthDays: 5,
    lutealPhaseDays: 14,
    minCycle: 20,
    maxCycle: 40,
    timezone: "Asia/Kolkata",
};

// helper to clamp integer safely
const clampInt = (n, min, max) =>
    Number.isInteger(n) ? Math.max(min, Math.min(max, n)) : null;

const CycleCalendarComponent = ({
                                profile = {},
                                lastPeriodDateStr,        // optional override: "YYYY-MM-DD"
                                cycleLength,              // optional override: number
                                month,                    // optional moment() date within month to display
                                timezone = DEFAULTS.timezone,
                                periodLengthDays = DEFAULTS.periodLengthDays, // explicit override wins
                                lutealPhaseDays = DEFAULTS.lutealPhaseDays,
                                minCycle = DEFAULTS.minCycle,
                                maxCycle = DEFAULTS.maxCycle,
                                className = "",
                                }) => {
    const role = Number(profile?.role ?? 0); // 2 = Pregnant Mom, 3 = TTC
    const isTTC = role === 3;

    const lmpStr = lastPeriodDateStr ?? profile?.last_period_date ?? null;
    const cycLen = Number.isInteger(cycleLength)
        ? cycleLength
        : Number(profile?.cycle_length) || null;

    const profilePeriodLen = clampInt(Number(profile?.period_length), 2, 10);

    const resolvedPeriodLength =
         profilePeriodLen ?? // if caller passed a valid override, use it
         clampInt(periodLengthDays, 2, 10) ??                  // else use profile value if valid
        DEFAULTS.periodLengthDays;           // else fallback default

    const startOfMonth = useMemo(
        () =>
            month
                ? moment.tz(month, timezone).startOf("month")
                : moment.tz(timezone).startOf("month"),
        [month, timezone]
    );
    const endOfMonth = useMemo(
        () => startOfMonth.clone().endOf("month"),
        [startOfMonth]
    );

    const isValidISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
    const within = (day, start, end) => day.isBetween(start, end, "day", "[]");

    const cycleBlocks = useMemo(() => {
        if (!isTTC) return [];
        if (!isValidISODate(lmpStr)) return [];
        if (!Number.isInteger(cycLen) || cycLen < minCycle || cycLen > maxCycle) return [];

        const lastPeriodStart = moment.tz(lmpStr, "YYYY-MM-DD", true, timezone);
        if (!lastPeriodStart.isValid()) return [];

        const results = [];
        let cycleStart = lastPeriodStart.clone();

        while (cycleStart.isAfter(startOfMonth, "day")) {
            cycleStart = cycleStart.clone().subtract(cycLen, "days");
        }
        while (cycleStart.isBefore(startOfMonth, "day")) {
            cycleStart = cycleStart.clone().add(cycLen, "days");
        }
        cycleStart = cycleStart.clone().subtract(cycLen, "days");

        const monthEndBuffer = endOfMonth.clone().add(cycLen, "days");
        let cur = cycleStart.clone();

        while (cur.isSameOrBefore(monthEndBuffer, "day")) {
            const periodStart = cur.clone();
            const periodEnd = periodStart.clone().add(resolvedPeriodLength - 1, "days"); // <-- uses resolved value

            const ovulationOffset = cycLen - lutealPhaseDays;
            const ovulationDay = periodStart.clone().add(ovulationOffset, "days");

            const fertileStart = ovulationDay.clone().subtract(5, "days");
            const fertileEnd = ovulationDay.clone().add(1, "days");

            const intersectsMonth =
                within(periodStart, startOfMonth, endOfMonth) ||
                within(periodEnd, startOfMonth, endOfMonth) ||
                within(fertileStart, startOfMonth, endOfMonth) ||
                within(fertileEnd, startOfMonth, endOfMonth) ||
                within(startOfMonth, periodStart, periodEnd) ||
                within(startOfMonth, fertileStart, fertileEnd);

            if (intersectsMonth) {
                results.push({
                    periodStart,
                    periodEnd,
                    ovulationDay,
                    fertileStart,
                    fertileEnd,
                });
            }
            cur = cur.clone().add(cycLen, "days");
        }

        return results;
    }, [
        isTTC,
        lmpStr,
        cycLen,
        minCycle,
        maxCycle,
        startOfMonth,
        endOfMonth,
        resolvedPeriodLength,
        lutealPhaseDays,
        timezone,
    ]);

    const isPeriodDay = (day) =>
        cycleBlocks.some((b) => within(day, b.periodStart, b.periodEnd));
    const isOvulationDay = (day) =>
        cycleBlocks.some((b) => day.isSame(b.ovulationDay, "day"));
    const isFertileDay = (day) =>
        cycleBlocks.some((b) => within(day, b.fertileStart, b.fertileEnd));

    const showTTCInfo =
        isTTC &&
        isValidISODate(lmpStr) &&
        Number.isInteger(cycLen) &&
        cycLen >= minCycle &&
        cycLen <= maxCycle;

    const daysInMonth = useMemo(() => {
        const days = [];
        let d = startOfMonth.clone();
        while (d.isSameOrBefore(endOfMonth, "day")) {
            days.push(d.clone());
            d.add(1, "day");
        }
        return days;
    }, [startOfMonth, endOfMonth]);

    const weekStart = useMemo(
        () => moment.tz(timezone).startOf("week").add(1, "day"),
        [timezone]
    );
    const daysOfWeek = useMemo(
        () => Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, "days")),
        [weekStart]
    );

    return (
        <div className={`cycle-card main_cycle_calendar_section ${className || ""}`}>
            <div className="dash-card-head">
                <h3>Cycle Calendar</h3>
                <small>{startOfMonth.format("MMMM YYYY")}</small>
            </div>

            <div className="dash-card-body">
                {/* Week Days (Mon–Sun) */}
                <div className="calendar-strip">
                    {daysOfWeek.map((day, idx) => (
                        <span key={idx}>{day.format("dd").charAt(0)}</span>
                    ))}
                </div>

                {/* Dates grid */}
                <div className="calendar-dates">
                    {daysInMonth.map((day, idx) => {
                        const isToday = moment.tz(timezone).isSame(day, "day");

                        const fertile = showTTCInfo ? isFertileDay(day) : false;
                        const period = showTTCInfo ? isPeriodDay(day) : false;
                        const ovulation = showTTCInfo ? isOvulationDay(day) : false;

                        return (
                            <span
                                key={idx}
                                className={[
                                    "calendar-day",
                                    isToday ? "today" : "",
                                    fertile ? "fertile" : "",
                                    period ? "period" : "",
                                    ovulation ? "ovulation" : "",
                                ]
                                    .join(" ")
                                    .trim()}
                                title={
                                    [
                                        isToday ? "Today" : "",
                                        period ? "Predicted Period" : "",
                                        ovulation ? "Estimated Ovulation" : "",
                                        fertile ? "Fertile Window" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" • ")
                                }
                            >
                {day.date()}
              </span>
                        );
                    })}
                </div>

                {/* Legend / Status */}
                {showTTCInfo ? (
                    <div className="legend">
                        <span className="legend-item period">Predicted Period</span>
                        <span className="legend-item fertile">Fertile Window</span>
                        <span className="legend-item ovulation">Ovulation</span>
                        <span className="legend-item today">Today</span>
                    </div>
                ) : isTTC ? (
                    <p className="status-text">
                        Add <strong>Last Period Date</strong> and <strong>Cycle Length</strong> to see predictions.
                    </p>
                ) : (
                    <p className="status-text">Cycle predictions are available for TTC profiles.</p>
                )}
            </div>
        </div>
    );
};

export default CycleCalendarComponent;
