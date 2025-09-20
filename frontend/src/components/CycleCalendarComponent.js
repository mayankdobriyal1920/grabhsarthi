// src/components/CycleCalendarComponent.js
import React, { useMemo } from "react";
import moment from "moment";

const DEFAULTS = {
    periodLengthDays: 5,
    lutealPhaseDays: 14,
    minCycle: 20,
    maxCycle: 40,
};

// helper to clamp integer safely
const clampInt = (n, min, max) =>
    Number.isFinite(n) && Number.isInteger(Number(n))
        ? Math.max(min, Math.min(max, Number(n)))
        : null;

const CycleCalendarComponent = ({
                                    profile = {},
                                    lastPeriodDateStr,        // optional override: "YYYY-MM-DD"
                                    cycleLength,              // optional override: number
                                    month,                    // optional moment()/Date/string within month to display
                                    // IGNORING TIMEZONE INTENTIONALLY
                                    periodLengthDays,         // optional explicit override (2–10). If undefined, fall back to profile/default.
                                    lutealPhaseDays = DEFAULTS.lutealPhaseDays,
                                    minCycle = DEFAULTS.minCycle,
                                    maxCycle = DEFAULTS.maxCycle,
                                    className = "",
                                }) => {
    const role = Number(profile?.role ?? 0); // 2 = Pregnant Mom, 3 = TTC
    const isTTC = role === 3;

    const lmpStr = lastPeriodDateStr ?? profile?.last_period_date ?? null;

    // cycle length: prop -> profile -> null
    const cycLen = Number.isInteger(cycleLength)
        ? cycleLength
        : Number.isFinite(Number(profile?.cycle_length))
            ? Number(profile?.cycle_length)
            : null;

    // resolve period length: explicit prop -> profile -> default
    const profilePeriodLen = clampInt(Number(profile?.period_length), 2, 10);
    const explicitPeriodLen = clampInt(Number(periodLengthDays), 2, 10);
    const resolvedPeriodLength =
        explicitPeriodLen ?? profilePeriodLen ?? DEFAULTS.periodLengthDays;

    const isValidISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
    const within = (day, start, end) => day.isBetween(start, end, "day", "[]");

    // month boundaries (local time, no timezone)
    const startOfMonth = useMemo(() => {
        const base = month ? moment(month) : moment();
        return base.startOf("month");
    }, [month]);

    const endOfMonth = useMemo(
        () => startOfMonth.clone().endOf("month"),
        [startOfMonth]
    );

    const cycleBlocks = useMemo(() => {
        if (!isTTC) return [];
        if (!isValidISODate(lmpStr)) return [];
        if (!Number.isInteger(cycLen) || cycLen < minCycle || cycLen > maxCycle)
            return [];

        // Parse LMP strictly at local midnight
        const lastPeriodStart = moment(lmpStr, "YYYY-MM-DD", true);
        if (!lastPeriodStart.isValid()) return [];

        const results = [];

        // Find a cycle anchor just before the visible month so we cover overlaps
        let cycleStart = lastPeriodStart.clone();

        while (cycleStart.isAfter(startOfMonth, "day")) {
            cycleStart = cycleStart.clone().subtract(cycLen, "days");
        }
        while (cycleStart.isBefore(startOfMonth, "day")) {
            cycleStart = cycleStart.clone().add(cycLen, "days");
        }
        // Step back one full cycle to ensure we include spillovers at the start
        cycleStart = cycleStart.clone().subtract(cycLen, "days");

        // Generate through a buffer past month end to catch late overlaps
        const monthEndBuffer = endOfMonth.clone().add(cycLen, "days");
        let cur = cycleStart.clone();

        while (cur.isSameOrBefore(monthEndBuffer, "day")) {
            const periodStart = cur.clone();
            const periodEnd = periodStart.clone().add(resolvedPeriodLength - 1, "days");

            const ovulationOffset = cycLen - lutealPhaseDays; // typical rule of thumb
            const ovulationDay = periodStart.clone().add(ovulationOffset, "days");

            const fertileStart = ovulationDay.clone().subtract(5, "days");
            const fertileEnd = ovulationDay.clone().add(1, "days"); // include ovulation & day after

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

    // Monday-first row labels using ISO week (no timezone)
    const weekStart = useMemo(() => moment().startOf("isoWeek"), []);
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
                        const isToday = moment().isSame(day, "day");

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
                        <span className="legend-item period">Periods</span>
                        <span className="legend-item fertile">Fertile Window</span>
                        <span className="legend-item ovulation">Ovulation</span>
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
