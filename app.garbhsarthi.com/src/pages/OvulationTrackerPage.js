import React, { useRef, useState, useEffect,useMemo } from "react";
import {IonPage, IonContent, IonIcon} from "@ionic/react";
import {fitness} from "ionicons/icons";
import moment from "moment-timezone";
import CycleCalendarComponent from "../components/CycleCalendarComponent";
import useStore from "../zustand/useStore";

const OvulationTracker = () => {
    const { userAuthDetail } = useStore();
    const { userInfo } = userAuthDetail || {};
    const profile = userInfo?.profile || {};
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [bpm, setBpm] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0)
    const [messageHtml, setMessageHtml] = useState(null);
    const [lmp, setLmp] = useState(moment(profile?.last_period_date));
    const [cycleLength, setCycleLength] = useState(profile?.cycle_length);
    const [baselineBpm, setBaselineBpm] = useState(null);
    const [baselineData, setBaselineData] = useState([]);
    const [detectedOvulationDay, setDetectedOvulationDay] = useState(null);

    const handleLmpChange = (e) => {
        if(e.target.value){
            setLmp(moment(e.target.value));
            console.log(moment(e.target.value).format('YYYY-MM-DD'))
        }
    };

    const handleCycleChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setCycleLength(val);
    };

    // Camera access
    const startScan = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();

                // Enable torch for better PPG signal
                const track = stream.getVideoTracks()[0];
                if (track.getCapabilities && track.getCapabilities().torch) {
                    try {
                        await track.applyConstraints({ advanced: [{ torch: true }] });
                        console.log("Torch enabled");
                    } catch (err) {
                        console.warn("Torch not supported:", err);
                    }
                }

            }
            setScanning(true);
            setTimeLeft(45);
            setBpm(0);
            console.log("🚀 Starting BPM scan for ovulation tracking");
        } catch (err) {
            console.error("📱 Camera error:", err);
        }
    };

    const stopScan = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setScanning(false);
        setTimeLeft(0);
    };

    // Countdown timer
    useEffect(() => {
        if (!scanning || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopScan();
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [scanning, timeLeft]);

    // Store each scan with day info
    useEffect(() => {
        if (!scanning && bpm && lmp) {
            const today = moment();
            const cycleDay = today.diff(lmp, "days") + 1;

            // Save scan record
            const scanRecord = { day: cycleDay, bpm, ts: Date.now() };
            const history = JSON.parse(localStorage.getItem("bpmHistory") || "[]");
            history.push(scanRecord);
            localStorage.setItem("bpmHistory", JSON.stringify(history));

            // Baseline collection (Day 1–5)
            if (cycleDay >= 1 && cycleDay <= 5) {
                setBaselineData(prev => {
                    const updated = [...prev, bpm];
                    localStorage.setItem("baselineData", JSON.stringify(updated));
                    return updated;
                });
            }
        }
    }, [scanning, bpm, lmp]);

    // Detect ovulation from BPM rise
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("bpmHistory") || "[]");
        const baselineArr = JSON.parse(localStorage.getItem("baselineData") || "[]");
        if (!baselineArr.length) return;

        const baseline = baselineArr.reduce((a, b) => a + b, 0) / baselineArr.length;

        const threshold = baseline + 3;
        let riseCount = 0;
        let detectedDay = null;

        for (const entry of history) {
            if (entry.bpm > threshold) {
                riseCount++;
                if (riseCount >= 2 && !detectedDay) {
                    detectedDay = entry.day;
                }
            } else {
                riseCount = 0;
            }
        }

        if (detectedDay) {
            setDetectedOvulationDay(detectedDay);
            console.log("🌸 Ovulation detected via BPM rise, cycle day:", detectedDay);
        }
    }, [baselineData]);

    useEffect(() => {
        if (!scanning) return;

        const SAMPLE_RATE = 30;
        const WINDOW_SIZE = SAMPLE_RATE * 10; // ~10 seconds of frames
        const MIN_BPM = 50, MAX_BPM = 180;
        const ctx = canvasRef.current?.getContext("2d");

        let frameCount = 0;
        const greenValues = [];
        const timestamps = [];

        const bandpass = (data) => {
            const mean = data.reduce((a, b) => a + b, 0) / data.length;
            return data.map(v => v - mean); // basic detrend
            // For production: apply real 0.8–3 Hz bandpass filter
        };

        const findPeaks = (data, fs, thresholdFactor = 1.0) => {
            const mean = data.reduce((a, b) => a + b, 0) / data.length;
            const std = Math.sqrt(data.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / data.length);
            const threshold = mean + thresholdFactor * std;
            const peaks = [];
            for (let i = 1; i < data.length - 1; i++) {
                if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
                    peaks.push(i);
                }
            }
            return peaks;
        };

        const interval = setInterval(() => {
            if (!videoRef.current || !ctx) return;

            ctx.drawImage(videoRef.current, 0, 0, 50, 50);
            const frame = ctx.getImageData(0, 0, 50, 50);
            let greenSum = 0;
            const pixels = frame.data.length / 4;
            for (let i = 0; i < frame.data.length; i += 4) {
                greenSum += frame.data[i + 1];
            }

            greenValues.push(greenSum / pixels);
            timestamps.push(Date.now());
            frameCount++;

            if (greenValues.length > WINDOW_SIZE) {
                greenValues.shift();
                timestamps.shift();
            }

            // Process every ~5 seconds
            if (frameCount % (SAMPLE_RATE * 5) === 0 && greenValues.length >= SAMPLE_RATE * 5) {
                const signal = bandpass(greenValues.slice());
                const peaks = findPeaks(signal, SAMPLE_RATE, 1.0);

                if (peaks.length >= 2) {
                    const intervals = [];
                    for (let i = 1; i < peaks.length; i++) {
                        const dt = (timestamps[peaks[i]] - timestamps[peaks[i - 1]]) / 1000;
                        const bpm = 60 / dt;
                        if (bpm >= MIN_BPM && bpm <= MAX_BPM) intervals.push(bpm);
                    }

                    if (intervals.length > 0) {
                        intervals.sort((a, b) => a - b);
                        const median = intervals[Math.floor(intervals.length / 2)];
                        if (!bpm || Math.abs(median - bpm) / bpm < 0.2) {
                            setBpm(prev => {
                                if (!prev || Math.abs(median - prev) / prev < 0.2) {
                                    return Math.round(median);
                                }
                                return prev;
                            });

                        }
                    }
                }
            }
        }, 1000 / SAMPLE_RATE);

        return () => clearInterval(interval);
    }, [scanning]);



// Load baseline from localStorage on mount
    useEffect(() => {
        const storedData = localStorage.getItem("baselineData");
        if (storedData) {
            const parsed = JSON.parse(storedData);
            setBaselineData(parsed);
            if (parsed.length > 0) {
                const avg = parsed.reduce((a, b) => a + b, 0) / parsed.length;
                setBaselineBpm(Math.round(avg));
            }
        }
    }, []);


    // Fertility message generator
    useEffect(() => {
        if (!bpm || !lmp || !cycleLength || scanning) {
            setMessageHtml(
                <div className="fertility-msg info">
                    <p>
                        To calculate your fertility status, please enter your last period,
                        cycle length, and scan your heart rate (BPM).
                    </p>
                </div>
            );
            return;
        }

        const today = moment();
        const cycleDay = today.diff(lmp, "days") + 1;

        // Use BPM-detected ovulation if available, else fallback to calendar estimate
        const ovulationDay = detectedOvulationDay
            ? moment(lmp).add(detectedOvulationDay - 1, "days")
            : moment(lmp).add(cycleLength - 14, "days");

        const fertileStart = moment(ovulationDay).subtract(5, "days");
        const fertileEnd = moment(ovulationDay).add(1, "days");

        // Compose message
        let fertilityStatus = null;

        if (today.isBetween(fertileStart, fertileEnd, "day", "[]")) {
            fertilityStatus = (
                <p key="fertileNow" className="fertile-now">
                    You are in your fertile window.{" "}
                    {baselineBpm && bpm >= baselineBpm + 2
                        ? detectedOvulationDay
                            ? "Your BPM rise confirms ovulation is near/ongoing. This is your most fertile time."
                            : "Your BPM is elevated above baseline, suggesting ovulation may be approaching. Best chances now."
                        : "Keep scanning daily — your fertile window is open."}
                </p>
            );
        } else if (today.isSame(ovulationDay, "day")) {
            fertilityStatus = (
                <p key="ovulationDay" className="ovulation-today">
                    {detectedOvulationDay
                        ? "Today matches your BPM-confirmed ovulation day! Peak fertility."
                        : "Today is your predicted ovulation day. Peak fertility."}
                </p>
            );
        } else if (today.isAfter(ovulationDay)) {
            fertilityStatus = (
                <p key="ovulationPassed" className="ovulation-passed">
                    {detectedOvulationDay
                        ? "BPM rise suggests ovulation has already occurred. Fertility window likely closed."
                        : "Ovulation likely passed based on cycle prediction."}
                </p>
            );
        } else {
            fertilityStatus = (
                <p key="ovulationSoon" className="ovulation-soon">
                    Ovulation predicted soon.{" "}
                    {baselineBpm && bpm >= baselineBpm + 2
                        ? "Your BPM is trending higher, suggesting ovulation may come earlier than expected."
                        : "Keep scanning BPM & watching your cycle signs."}
                </p>
            );
        }

        setMessageHtml(
            <div className="fertility-msg">
                <p>Cycle day {cycleDay}. BPM: {bpm}</p>
                {baselineBpm && <p>Baseline BPM: {baselineBpm}</p>}
                {fertilityStatus}
            </div>
        );
    }, [bpm, lmp, cycleLength, scanning, baselineBpm, detectedOvulationDay]);


    return (
        <IonPage className="ovulation-tracker-page">
            <IonContent fullscreen className="main-content-page ovulation-dashboard main-content-page">
                <div className="dash-wrap ovulation-dashboard-wrap">

                    {/* Heart BPM card */}
                    <div className="card heart-rate-card">
                        <div className={"heart-rate-card-grid"}>
                            <div className={"icon_g_sec"}>
                                <div className={`heart-icon ${scanning && bpm ? "beat" : ""}`}>
                                    <IonIcon icon={fitness} />
                                </div>
                                <video ref={videoRef} className="camera-preview" style={{ display: "none" }} width="200" height="150" />
                                <canvas ref={canvasRef} width="50" height="50" style={{ display: "none" }} />
                            </div>

                            <div className={"message_icon_grid"}>
                                <p className="bpm_heading">{!scanning && bpm ? `${bpm} BPM` : scanning ? "Scanning..." : "Scan Heart Rate"}</p>
                                {scanning ? (
                                        <div className="scan-info">
                                            <p className="timer">{timeLeft}s remaining</p>
                                        </div>
                                    ):
                                    <div className="scan-info">
                                        <p className="timer">Scan Timer</p>
                                    </div>
                                }
                                {!scanning ? (
                                    <button className="scan-btn" onClick={startScan}>Start Scan</button>
                                ) : (
                                    <button className="scan-btn" onClick={stopScan}>Stop Scan</button>
                                )}
                                {(scanning) ?
                                    <p className="bpm-note">Place your finger on the camera lens with flashlight ON</p>
                                    :
                                    <p className="bpm-note">Measured via phone scan</p>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Cycle Info */}
                    <div className="input-row-container">
                        <div className="input-row">
                            <div className="input-box">
                                <label>Last Period</label>
                                <div className="input-field">
                                    <input
                                        type="date"
                                        value={lmp.format('YYYY-MM-DD')}
                                        onChange={handleLmpChange}
                                    />
                                </div>
                            </div>

                            <div className="input-box">
                                <label>Cycle Length</label>
                                <div className="input-field">
                                    <input
                                        type="number"
                                        min="20"
                                        max="45"
                                        value={Number(cycleLength)}
                                        onChange={handleCycleChange}
                                    /> days
                                </div>
                            </div>
                        </div>
                        {(cycleLength < 15 || cycleLength > 50) &&
                            <span className={"error-msg"}>
                                Cycle length must be greater then 15 and smaller then 50
                            </span>
                        }
                    </div>

                    {/* Calendar */}
                    <CycleCalendarComponent
                        profile={profile} // role (2/3) comes from DB
                        lastPeriodDateStr={
                            moment.isMoment(lmp)
                                ? lmp.format("YYYY-MM-DD")
                                : typeof lmp === "string"
                                    ? lmp
                                    : undefined
                        }
                        cycleLength={Number(cycleLength) || undefined}
                        timezone="Asia/Kolkata"
                        period_length={Number(profile?.period_length) || undefined} // uses snake_case prop
                        lutealPhaseDays={14}
                    />



                    {/* Dynamic Fertility Message */}
                    <div className={"ovul_final_result_card"}>Final Result</div>
                    {(messageHtml) &&
                        <div className="card message-card">
                            <p className="fertile-message">{messageHtml}</p>
                        </div>
                    }

                    <div className={"ovul_final_result_card"}>How Fertility Detection Works</div>
                    <div className="card tasks card_for_tracker_info">
                        <ul className="card_for_tracker_info_inner_ul">
                            <li>
                                <strong>Baseline Days:</strong> Track your resting heart rate (BPM) during
                                the first 5 days of your cycle (period). This builds your personal baseline.
                            </li>
                            <li>
                                <strong>Regular Tracking:</strong> From day 6 onwards, scan your BPM at the
                                same time daily (preferably morning, before coffee or exercise).
                            </li>
                            <li>
                                <strong>Detection Method:</strong> Ovulation often causes a small but
                                sustained rise in resting BPM (around +2–4 beats above baseline for 2+ days).
                                Our app looks for this rise to estimate when ovulation may have occurred.
                            </li>
                            <li>
                                <strong>Cycle Prediction + BPM:</strong> We combine your cycle info (LMP +
                                cycle length) with your heart rate data. If BPM signals suggest earlier or
                                later ovulation, your fertile window will shift accordingly.
                            </li>
                            <li>
                                <strong>Important:</strong> This is <u>not a medical diagnosis</u>. Heart
                                rate can be influenced by stress, sleep, illness, caffeine, and other
                                factors. Accuracy improves the more consistently you track.
                            </li>
                            <li>
                                <strong>Best Practice:</strong> Use this as a supportive tool alongside
                                other fertility signs (like cervical mucus or ovulation kits).
                            </li>
                        </ul>
                    </div>
                </div>
            </IonContent>
        </IonPage>

    );
};

export default OvulationTracker;
