import React, { useRef, useState, useEffect,useMemo } from "react";
import {IonPage, IonContent, IonIcon} from "@ionic/react";
import {fitness} from "ionicons/icons";
import moment from "moment-timezone";
import { calendar, egg, heart, timer, alertCircle, checkmarkDone } from "ionicons/icons";

const OvulationTracker = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [bpm, setBpm] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [messageHtml, setMessageHtml] = useState(null);
    const [lmp, setLmp] = useState(moment()); // default
    const [cycleLength, setCycleLength] = useState(35);

    const ovulationDay = useMemo(() => {
        if (!lmp) return null;
        return moment(lmp).add(cycleLength - 14, "days");
    }, [lmp, cycleLength]);

    const fertileStart = useMemo(() => ovulationDay ? moment(ovulationDay).subtract(5, "days") : null, [ovulationDay]);
    const fertileEnd = useMemo(() => ovulationDay ? moment(ovulationDay).add(1, "days") : null, [ovulationDay]);
    const displayMonth = useMemo(() => ovulationDay ? moment(ovulationDay).startOf("month") : moment(lmp).startOf("month"), [ovulationDay, lmp]);


    const handleLmpChange = (e) => {
        if(e.target.value){
            setLmp(new Date(e.target.value));
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
                    await track.applyConstraints({
                        advanced: [{ torch: true }]
                    });
                    console.log("🔦 Torch enabled for better PPG signal");
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

    useEffect(() => {
        if (!scanning) return;

        let frameCount = 0;
        let redValues = [];
        let greenValues = [];
        let blueValues = [];
        let timestamps = [];
        const SAMPLE_RATE = 30; // 30 FPS
        const WINDOW_SIZE = 256; // ~8.5 seconds of data
        const MIN_BPM = 50;
        const MAX_BPM = 180;

        const ctx = canvasRef.current?.getContext("2d");

        // Simple moving average filter
        const movingAverage = (data, windowSize = 5) => {
            const result = [];
            for (let i = 0; i < data.length; i++) {
                const start = Math.max(0, i - windowSize + 1);
                const window = data.slice(start, i + 1);
                result.push(window.reduce((sum, val) => sum + val, 0) / window.length);
            }
            return result;
        };

        // Simple bandpass filter for heart rate frequencies
        const bandpassFilter = (data) => {
            // Detrend the signal (remove DC component)
            const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
            return data.map(val => val - mean);
        };

        // Find peaks in the signal
        const findPeaks = (data, minDistance = 10) => {
            const peaks = [];
            for (let i = minDistance; i < data.length - minDistance; i++) {
                let isPeak = true;

                // Check if current point is higher than surrounding points
                for (let j = i - minDistance; j <= i + minDistance; j++) {
                    if (j !== i && data[j] >= data[i]) {
                        isPeak = false;
                        break;
                    }
                }

                if (isPeak && data[i] > 0) { // Only positive peaks
                    peaks.push(i);
                }
            }
            return peaks;
        };

        const interval = setInterval(() => {
            if (!videoRef.current || !ctx) return;

            // Capture frame data
            ctx.drawImage(videoRef.current, 0, 0, 50, 50);
            const frame = ctx.getImageData(0, 0, 50, 50);

            let redSum = 0, greenSum = 0, blueSum = 0;
            const pixelCount = frame.data.length / 4;

            // Average RGB values across the frame
            for (let i = 0; i < frame.data.length; i += 4) {
                redSum += frame.data[i];
                greenSum += frame.data[i + 1];
                blueSum += frame.data[i + 2];
            }

            redValues.push(redSum / pixelCount);
            greenValues.push(greenSum / pixelCount);
            blueValues.push(blueSum / pixelCount);
            timestamps.push(Date.now());
            frameCount++;

            // Keep only recent data
            if (redValues.length > WINDOW_SIZE) {
                redValues.shift();
                greenValues.shift();
                blueValues.shift();
                timestamps.shift();
            }

            // Process signal every 30 frames (~1 second)
            if (frameCount % 30 === 0 && redValues.length >= 60) {
                try {
                    // Use green channel (most sensitive to blood volume changes)
                    let signal = [...greenValues];

                    // Apply smoothing
                    signal = movingAverage(signal, 3);

                    // Apply bandpass filter
                    signal = bandpassFilter(signal);

                    // Find peaks with minimum distance based on max heart rate
                    const minPeakDistance = Math.floor((60 / MAX_BPM) * SAMPLE_RATE);
                    const peaks = findPeaks(signal, minPeakDistance);

                    if (peaks.length >= 3) {
                        // Calculate intervals between peaks
                        const intervals = [];
                        for (let i = 1; i < peaks.length; i++) {
                            const interval = (peaks[i] - peaks[i-1]) / SAMPLE_RATE; // seconds
                            intervals.push(60 / interval); // convert to BPM
                        }

                        // Filter out unrealistic BPM values
                        const validBPMs = intervals.filter(bpm => bpm >= MIN_BPM && bpm <= MAX_BPM);

                        if (validBPMs.length > 0) {
                            // Use median BPM to reduce noise
                            validBPMs.sort((a, b) => a - b);
                            const medianBPM = validBPMs[Math.floor(validBPMs.length / 2)];
                            setBpm(Math.round(medianBPM));
                        }
                    }
                } catch (error) {
                    console.error("PPG processing error:", error);
                }
            }
        }, 1000 / SAMPLE_RATE); // ~33ms for 30 FPS

        return () => clearInterval(interval);
    }, [scanning]);



    useEffect(() => {
        if (!bpm || !lmp || !cycleLength || scanning) {
            setMessageHtml(
                <div className="fertility-msg info">
                    <p>ℹ️ To calculate your fertility status, please enter your last period, cycle length, and scan your heart rate (BPM).</p>
                </div>
            );
            return;
        }

        const today = moment();
        const cycleDay = today.diff(lmp, "days") + 1;
        const ovulationDayCalc = moment(lmp).add(cycleLength - 14, "days");
        const fertileStartCalc = moment(ovulationDayCalc).subtract(5, "days");
        const fertileEndCalc = moment(ovulationDayCalc).add(1, "days");

        let messageContent = [];

        // Cycle day
        messageContent.push(
            <p key="cycleDay" className="cycle-day">
                📅 Today is <strong>cycle day {cycleDay}</strong>.
            </p>
        );

        // Ovulation & fertile window
        messageContent.push(
            <p key="ovulation" className="ovulation-date">
                🔹 Ovulation is predicted on <strong>{ovulationDayCalc.format("dddd, DD MMM YYYY")}</strong>.
            </p>
        );
        messageContent.push(
            <p key="fertileWindow" className="fertile-window">
                🔹 Fertile window: <strong>{fertileStartCalc.format("DD MMM")} – {fertileEndCalc.format("DD MMM")}</strong>
            </p>
        );

        // Fertility status
        let fertilityStatus = null;
        if (today.isBetween(fertileStartCalc, fertileEndCalc, "day", "[]")) {
            fertilityStatus = (
                <p key="fertileNow" className="fertile-now">
                    🌸 You are in your fertile window.{" "}
                    {bpm > 80 ? "Your heart rate suggests ovulation is very near. Best chances now for conception ✨"
                        : "Keep calm, track your signs, and maintain a healthy lifestyle 💚"}
                </p>
            );
        } else if (today.isSame(ovulationDayCalc, "day")) {
            fertilityStatus = (
                <p key="ovulationDay" className="ovulation-today">
                    🥚 Today is your predicted ovulation day! Maximum fertility 🌟
                </p>
            );
        } else if (today.isAfter(ovulationDayCalc)) {
            fertilityStatus = (
                <p key="ovulationPassed" className="ovulation-passed">
                    🌙 Ovulation likely passed. Focus on rest, balance & self-care 💆‍♀️
                </p>
            );
        } else {
            fertilityStatus = (
                <p key="ovulationSoon" className="ovulation-soon">
                    🔜 Ovulation predicted soon. Keep scanning BPM & tracking signs.
                </p>
            );
        }

        messageContent.push(fertilityStatus);

        setMessageHtml(<div className="fertility-msg">{messageContent}</div>);
    }, [scanning, bpm, lmp, cycleLength]);


    return (
        <IonPage className="ovulation-tracker-page">
            <IonContent fullscreen className="main-content-page ovulation-dashboard main-contant-page">
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
                                <p className="bpm_heading">{bpm ? `${bpm} BPM` : scanning ? "Scanning..." : "Scan Heart Rate"}</p>
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
                                        value={lmp.toISOString().split("T")[0]}
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
                    <div className="card calendar-card">
                        <h3>{displayMonth.format("MMMM YYYY")}</h3>
                        <div className="calendar-grid">
                            <span>S</span><span>M</span><span>T</span>
                            <span>W</span><span>T</span><span>F</span><span>S</span>

                            {Array.from({ length: displayMonth.daysInMonth() }, (_, i) => {
                                const day = moment(displayMonth).date(i + 1);

                                const isOvulation = day.isSame(ovulationDay, "day");
                                const isFertile = day.isBetween(fertileStart, fertileEnd, "day", "[]");
                                const isToday = day.isSame(moment(), "day");

                                return (
                                    <span
                                        key={i}
                                        className={
                                            isOvulation
                                                ? "ovulation-day"
                                                : isFertile
                                                    ? "highlight"
                                                    : isToday
                                                        ? "today"
                                                        : ""
                                        }>
                                  {i + 1}
                                </span>
                                );
                            })}
                        </div>

                        <p className="ovulation-text">
                            Predicted Ovulation: <strong>{ovulationDay.format("ddd, DD MMM YYYY")}</strong>
                        </p>
                        <p className="fertile-window">
                            {fertileStart.format("DD MMM")} – {fertileEnd.format("DD MMM")}
                        </p>
                    </div>


                    {/* Dynamic Fertility Message */}
                    {(messageHtml) &&
                        <div className="card message-card">
                            <p className="fertile-message">{messageHtml}</p>
                        </div>
                    }

                    {/* Save Button */}
                    <button className="save-btn">Save & Set Reminders</button>
                </div>
            </IonContent>
        </IonPage>

    );
};

export default OvulationTracker;
