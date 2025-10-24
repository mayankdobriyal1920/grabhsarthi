// src/components/CycleCalendarComponent.js
import React, { useMemo, useState } from "react";
import moment from "moment";
import { IonIcon, IonRouterLink } from "@ionic/react";
import { chevronForward } from "ionicons/icons";

const DEFAULTS = {
    periodLengthDays: 5,
    lutealPhaseDays: 14,
    minCycle: 20,
    maxCycle: 40,
};

const clampInt = (n, min, max) =>
    Number.isFinite(n) && Number.isInteger(Number(n))
        ? Math.max(min, Math.min(max, Number(n)))
        : null;

const CycleCalendarComponent = ({
                                    isDashboardPage,
                                    profile = {},
                                    lastPeriodDateStr,
                                    cycleLength,
                                    month, // optional external control
                                    periodLengthDays,
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
        : Number.isFinite(Number(profile?.cycle_length))
            ? Number(profile?.cycle_length)
            : null;

    const profilePeriodLen = clampInt(Number(profile?.period_length), 2, 10);
    const explicitPeriodLen = clampInt(Number(periodLengthDays), 2, 10);
    const resolvedPeriodLength =
        explicitPeriodLen ?? profilePeriodLen ?? DEFAULTS.periodLengthDays;

    const isValidISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
    const within = (day, start, end) => day.isBetween(start, end, "day", "[]");

    // If parent doesn't pass `month`, we manage it locally so the Next button works.
    const isControlledMonth = !!month;
    const [internalMonth, setInternalMonth] = useState(moment());
    const baseMonth = isControlledMonth ? moment(month) : internalMonth;

    const startOfMonth = useMemo(() => baseMonth.clone().startOf("month"), [baseMonth]);
    const endOfMonth = useMemo(() => startOfMonth.clone().endOf("month"), [startOfMonth]);

    const goPrevMonth = () => {
        if (!isControlledMonth) {
            setInternalMonth((m) => m.clone().subtract(1, "month"));
        }
    };


    const goNextMonth = () => {
        if (!isControlledMonth) {
            setInternalMonth((m) => m.clone().add(1, "month"));
        }
    };

    const cycleBlocks = useMemo(() => {
        if (!isTTC) return [];
        if (!isValidISODate(lmpStr)) return [];
        if (!Number.isInteger(cycLen) || cycLen < minCycle || cycLen > maxCycle) return [];

        const lastPeriodStart = moment(lmpStr, "YYYY-MM-DD", true);
        if (!lastPeriodStart.isValid()) return [];

        const results = [];

        // Anchor near the visible month so we cover overlaps
        let cycleStart = lastPeriodStart.clone();
        while (cycleStart.isAfter(startOfMonth, "day")) cycleStart = cycleStart.clone().subtract(cycLen, "days");
        while (cycleStart.isBefore(startOfMonth, "day")) cycleStart = cycleStart.clone().add(cycLen, "days");
        cycleStart = cycleStart.clone().subtract(cycLen, "days");

        const monthEndBuffer = endOfMonth.clone().add(cycLen, "days");
        let cur = cycleStart.clone();

        while (cur.isSameOrBefore(monthEndBuffer, "day")) {
            const periodStart = cur.clone();
            const periodEnd = periodStart.clone().add(resolvedPeriodLength - 1, "days");

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
                results.push({ periodStart, periodEnd, ovulationDay, fertileStart, fertileEnd });
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

    const isPeriodDay = (day) => cycleBlocks.some((b) => within(day, b.periodStart, b.periodEnd));
    const isOvulationDay = (day) => cycleBlocks.some((b) => day.isSame(b.ovulationDay, "day"));
    const isFertileDay = (day) => cycleBlocks.some((b) => within(day, b.fertileStart, b.fertileEnd));

    const showTTCInfo =
        isTTC && isValidISODate(lmpStr) && Number.isInteger(cycLen) && cycLen >= minCycle && cycLen <= maxCycle;

    // Build calendar cells with Monday-first alignment.
    const daysInMonth = useMemo(() => {
        const days = [];
        let d = startOfMonth.clone();
        while (d.isSameOrBefore(endOfMonth, "day")) {
            days.push(d.clone());
            d.add(1, "day");
        }
        return days;
    }, [startOfMonth, endOfMonth]);

    // Number of leading blanks before the 1st (isoWeekday: 1=Mon..7=Sun)
    const leading = startOfMonth.isoWeekday() - 1; // 0 if Monday
    const leadingCells = Array.from({ length: leading }, () => null);
    const totalCells = leading + daysInMonth.length;
    const trailing = (7 - (totalCells % 7)) % 7;
    const trailingCells = Array.from({ length: trailing }, () => null);
    const calendarCells = [...leadingCells, ...daysInMonth, ...trailingCells];

    const weekStart = useMemo(() => moment().startOf("isoWeek"), []);
    const daysOfWeek = useMemo(
        () => Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, "days")),
        [weekStart]
    );

    return (
        <div className={`cycle-card main_cycle_calendar_section ${className || ""}`}>
            <div className="dash-card-head">
                {isDashboardPage ? (
                    <div className={"heading_and_detail_button"}>
                        <h3>Cycle Calendar</h3>
                        <IonRouterLink routerLink={"/dashboard/tracker"} className={"heading_and_detail_button_chevron_icon"}>
                            <div>
                                Details <IonIcon icon={chevronForward}></IonIcon>
                            </div>
                        </IonRouterLink>
                    </div>
                ) : (
                    <h3>Cycle Calendar</h3>
                )}

                <div className="calendar-month-nav">
                    <button
                        type="button"
                        onClick={goPrevMonth}
                        aria-label="Previous month"
                        className="calendar-prev-btn"
                        title={isControlledMonth ? "Parent controls month" : "Previous month"}
                    >
                        {/* Left chevron by rotating the same icon */}
                        <IonIcon icon={chevronForward} style={{ transform: "rotate(180deg)" }} />
                    </button>

                    <div className={"month_nave_name"}>
                        {startOfMonth.format("MMMM YYYY")}
                    </div>

                    <button
                        type="button"
                        onClick={goNextMonth}
                        aria-label="Next month"
                        className="calendar-next-btn"
                        title={isControlledMonth ? "Parent controls month" : "Next month"}
                    >
                        <IonIcon icon={chevronForward} />
                    </button>
                </div>
            </div>


            <div className="dash-card-body">
                {/* Week Days (Mon–Sun) */}
                <div className="calendar-strip">
                    {daysOfWeek.map((day, idx) => (
                        <span key={idx}>{day.format("dd").charAt(0)}</span>
                    ))}
                </div>

                {/* Dates grid (with leading/trailing blanks) */}
                <div className="calendar-dates">
                    {calendarCells.map((cell, idx) => {
                        if (cell === null) {
                            return <span key={idx} className="calendar-day empty" aria-hidden="true" />;
                        }
                        const day = cell;
                        const isToday = moment().isSame(day, "day");

                        const fertile = showTTCInfo ? isFertileDay(day) : false;
                        const period = showTTCInfo ? isPeriodDay(day) : false;
                        const ovulation = showTTCInfo ? isOvulationDay(day) : false;

                        return (
                            <span
                                key={idx}
                                className={[
                                    "calendar-day",
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
