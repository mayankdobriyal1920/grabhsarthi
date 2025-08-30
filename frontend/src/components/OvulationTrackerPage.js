import React, { useRef, useState, useEffect } from "react";
import {IonPage, IonContent, IonIcon} from "@ionic/react";
import {fitness} from "ionicons/icons";

const OvulationTracker = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [bpm, setBpm] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [message, setMessage] = useState('');

    // Default LMP + cycle length
    const lmp = new Date("2023-08-20");
    const cycleLength = 35;
    const ovulationDay = new Date(lmp);
    ovulationDay.setDate(lmp.getDate() + cycleLength - 14);

    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);
    const fertileEnd = new Date(ovulationDay);

    // Camera access
    const startScan = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }, // rear camera
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setScanning(true);
            setTimeLeft(45); // 45 second timer
        } catch (err) {
            console.error("Camera error:", err);
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
        if (scanning) return;

        const today = new Date();
        if (today >= fertileStart && today <= fertileEnd) {
            if (bpm > 75) {
                setMessage("🌸 Your fertile window is open and your BPM suggests ovulation might be near. Stay hopeful ✨");
            } else {
                setMessage("💚 You're in your fertile window. Take care of yourself and stay positive 💕");
            }
        } else if (today.toDateString() === ovulationDay.toDateString()) {
            setMessage("🥚 Today is your predicted ovulation day! Sending you baby dust 🌟");
        } else if (today > ovulationDay) {
            setMessage("🌙 Ovulation likely passed. Focus on rest, balance, and self-care 💆‍♀️");
        } else {
            setMessage("📅 Tracking ahead of ovulation. Keep monitoring BPM for changes.");
        }
    }, [scanning, bpm, fertileStart, fertileEnd, ovulationDay]);

    return (
        <IonPage className="ovulation-tracker-page">
            <IonContent fullscreen className="main-content-page ovulation-dashboard main-contant-page">
                <div className="dash-wrap ovulation-dashboard-wrap">
                    {/* Heart BPM card */}
                    <div className="card heart-rate-card">
                        <div className={`heart-icon ${bpm ? "beat" : ""}`}>
                            <IonIcon icon={fitness} />
                        </div>
                        {!scanning ?
                            (<button className="scan-btn" onClick={startScan}>Start Scan</button> )
                            :
                            (<button className="scan-btn" onClick={stopScan}>Stop Scan</button> )
                        }
                        {scanning && (
                            <div className="scan-info"> <p className="instruction">
                                👉 Place your finger on the camera lens with flashlight ON</p>
                                <p className="timer">⏳ {timeLeft}s remaining</p>
                            </div>
                        )}
                        <p className="bpm"> {bpm ? `${bpm} BPM` : scanning ? "Scanning..." : "No Data"}</p>
                        <p className="bpm-note">Measured via phone scan</p>
                    </div>

                    {/* Cycle Info */}
                    <div className="input-row">
                        <div className="input-box">
                            <label>Last Period</label>
                            <div className="input-field">{lmp.toDateString()}</div>
                        </div>
                        <div className="input-box">
                            <label>Cycle Length</label>
                            <div className="input-field">{cycleLength} days</div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="card calendar-card">
                        <h3>September 2023</h3>
                        <div className="calendar-grid">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                            {Array.from({ length: 30 }, (_, i) => {
                                const day = new Date("2023-09-01");
                                day.setDate(i + 1);
                                const dateStr = day.toDateString();
                                const isOvulation = dateStr === ovulationDay.toDateString();
                                const isFertile = day >= fertileStart && day <= fertileEnd;

                                return (
                                    <span
                                        key={i}
                                        className={
                                            isOvulation
                                                ? "ovulation-day"
                                                : isFertile
                                                    ? "highlight"
                                                    : ""
                                        }
                                    >
                                        {i + 1}
                                    </span>
                                );
                            })}
                        </div>
                        <p className="ovulation-text">
                            Predicted Ovulation: <strong>{ovulationDay.toDateString()} 🌸</strong>
                        </p>
                        <p className="fertile-window">
                            {fertileStart.toDateString()} – {fertileEnd.toDateString()}
                        </p>
                    </div>

                    {/* Dynamic Fertility Message */}
                    <div className="card message-card">
                        <p className="fertile-message">{message}</p>
                    </div>

                    {/* Save Button */}
                    <button className="save-btn">Save & Set Reminders</button>
                </div>
            </IonContent>

            <style>
                {`
                .ovulation-dashboard-wrap {
                    font-family: 'DM Sans', sans-serif;
                    color: #333;
                    padding: 20px;
                }
                .ovulation-dashboard-wrap .page-title {
                    text-align: center;
                    font-size: 22px;
                    font-weight: bold;
                    color: #e46983;
                    margin-bottom: 20px;
                }
                /* Card */
                .ovulation-dashboard-wrap .card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 18px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }
                /* Heart */
                .ovulation-dashboard-wrap .heart-icon {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 10px;
                    color: #e46983;
                }
                .ovulation-dashboard-wrap .heart-icon.beat {
                    animation: heartbeat 1s infinite;
                }
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.2); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .ovulation-dashboard-wrap .bpm {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    margin: 5px 0;
                }
                .ovulation-dashboard-wrap .bpm-note {
                    font-size: 12px;
                    color: #777;
                    text-align: center;
                }
                /* Inputs */
                .ovulation-dashboard-wrap .input-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                }
                .ovulation-dashboard-wrap .input-box {
                    flex: 1;
                }
                .ovulation-dashboard-wrap .input-field {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 10px;
                    font-size: 14px;
                }
                /* Calendar */
                .ovulation-dashboard-wrap .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                    font-size: 14px;
                }
                .ovulation-dashboard-wrap .calendar-grid span {
                    padding: 6px;
                    border-radius: 50%;
                }
                .ovulation-dashboard-wrap .calendar-grid .highlight {
                    background: #c7ebe6;
                    color: #065f55;
                }
                .ovulation-dashboard-wrap .calendar-grid .ovulation-day {
                    background: #e46983;
                    color: #fff;
                    font-weight: bold;
                }
                .ovulation-dashboard-wrap .ovulation-text {
                    color: #e46983;
                    font-weight: bold;
                    margin-top: 10px;
                }
                /* Fertile message */
                .ovulation-dashboard-wrap .message-card {
                    text-align: center;
                    background: #fdf0f4;
                    border: 1px solid #f7c8d1;
                }
                .ovulation-dashboard-wrap .fertile-message {
                    font-size: 15px;
                    font-weight: 500;
                    color: #444;
                }
                /* Save Button */
                .ovulation-dashboard-wrap .save-btn {
                    background: #e46983;
                    color: #fff;
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: 30px;
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 20px;
                }
                `}
            </style>
        </IonPage>
    );
};

export default OvulationTracker;
