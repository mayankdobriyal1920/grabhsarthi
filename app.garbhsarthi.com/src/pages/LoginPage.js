import React, { useState, useRef } from "react";
import {
    IonPage,
    IonContent,
    IonIcon,
    IonModal, IonLoading
} from "@ionic/react";
import {closeOutline, mailOutline} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import loginPageSvg from "../theme/img/login_page_svg.svg";
import {
    actionToGenerateOtpForEmailAddress,
    actionToGenerateVerifyOtpAndLoginSignupUser
} from "../apiHelper/CommonAction";
import useStore from "../zustand/useStore";

const LoginPage = () => {
    const history = useHistory();
    const {setUserAuthDetail} = useStore();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timer, setTimer] = useState(900); // 15 minutes
    const [emailAddress, setEmailAddress] = useState("");
    const [error, setError] = useState("");
    const [loadingApiCall, setLoadingApiCall] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const inputRefs = useRef([]);
    const intervalRef = useRef(null);

    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    const resendOtp = () => {
        setOtp(new Array(6).fill(""));
        handleSubmitSendOtp();
    };

    // Phone number validation (basic)
    const validateEmailAddress = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const handleSubmitSendOtp = () => {
        if (!validateEmailAddress(emailAddress)) {
            setError("Please enter a valid Email address.");
            return;
        }
        if(intervalRef?.current){
            clearInterval(intervalRef?.current);
            setTimer(900);
        }
        setError("");
        setOtpError("");
        setOtp(new Array(6).fill(""));
        setLoadingApiCall(true);
        actionToGenerateOtpForEmailAddress(emailAddress).then(()=>{
            setLoadingApiCall(false);
            setShowOtpModal(true);
            if (showOtpModal && timer > 0) {
                intervalRef.current = setInterval(() => {
                    setTimer((t) => t - 1);
                }, 1000);
            }
        })
    };

    const handleVerifyOtpCall = () => {
        setLoadingApiCall(true);
        actionToGenerateVerifyOtpAndLoginSignupUser(emailAddress,otp.toString().replaceAll(',','')).then((responseData)=>{
            setLoadingApiCall(false);
            if(responseData?.success === 1) {
                setUserAuthDetail(responseData?.userData);
                history.replace("/choose-role")
            }else{
                setOtpError(true);
            }
        })
    }

    const handleChange = (e, index) => {
        const raw = e.target.value.replace(/\D/g, "");
        const newOtp = [...otp];

        if (raw.length === 0) {
            // user cleared the input
            newOtp[index] = "";
            setOtp(newOtp);
            return;
        }

        // only keep the last digit typed (avoids multi-char on mobile keyboards)
        newOtp[index] = raw.slice(-1);
        setOtp(newOtp);

        // move focus forward
        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            e.preventDefault(); // stop the browser from changing caret behavior

            const newOtp = [...otp];

            if (newOtp[index]) {
                // if there's a digit here, clear it
                newOtp[index] = "";
                setOtp(newOtp);
                return;
            }

            // current empty -> move focus left and clear that one too (optional)
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                // OPTIONAL: also clear previous cell on backspace
                // const prev = [...newOtp];
                // if (prev[index - 1]) {
                //   prev[index - 1] = "";
                //   setOtp(prev);
                // }
            }
        }

        if (e.key === "Delete") {
            e.preventDefault();
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }

        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Optional: paste "123456" into the first box to fill all
    const handlePaste = (e) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!text) return;
        const digits = text.slice(0, 6).split("");
        const next = new Array(6).fill("");
        for (let i = 0; i < digits.length; i++) next[i] = digits[i];
        setOtp(next);
        const last = Math.min(digits.length, 6) - 1;
        if (last >= 0) inputRefs.current[last]?.focus();
    };

    return (
        <IonPage>
            <IonContent fullscreen className="login-content">
                <div className="login-container">
                    {/* Logo */}
                    <div className="logo-wrapper">
                        <img src={loginPageSvg} alt="logo" />
                    </div>

                    <h1 className="login-heading heading">Get Started, Future Mommies!</h1>

                    {/* Input */}
                    <div className="input-wrapper card">
                        <span className="input-icon">
                          <IonIcon icon={mailOutline} />
                        </span>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="custom-input"
                            value={emailAddress}
                            onChange={(e) =>
                                setEmailAddress(e.target.value)
                            }
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    {/* Continue Button */}
                    <button
                        onClick={handleSubmitSendOtp}
                        className="start-button submit-btn"
                    >
                        SUBMIT
                    </button>

                    {/* Footer Links */}
                    {/*<div className="footer-links">*/}
                    {/*    <a href="https://garbhsarthi.com/terms.html">Terms and Conditions</a>*/}
                    {/*    <span>•</span>*/}
                    {/*    <a href="https://garbhsarthi.com/privacy.html">Privacy Policy</a>*/}
                    {/*</div>*/}
                </div>

                {/* OTP Modal */}
                <IonModal
                    isOpen={showOtpModal}
                    onDidDismiss={() => setShowOtpModal(false)}
                    breakpoints={[0, 0.5]}
                    initialBreakpoint={0.5}
                    className="otp-modal">
                    <div className="otp-container">
                        <button
                            className="close-btn"
                            onClick={() => setShowOtpModal(false)}>
                            <IonIcon icon={closeOutline} />
                        </button>

                        <h2 className="otp-title">Enter OTP</h2>
                        <p className="otp-subtitle">We’ve sent a 6-digit code to your email</p>

                        <div className="otp-inputs">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength="1"
                                    value={digit}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    onChange={(e) => handleChange(e, i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    onPaste={i === 0 ? handlePaste : undefined}
                                    className="otp-box"
                                />
                            ))}
                        </div>
                        <p className={"error-text"}>
                        {(otpError) ?
                            'Incorrected OTP Please enter valid otp!'
                            :''
                        }
                        </p>

                        <div className="otp-timer">
                            {timer > 0 ? (
                                <span>Resend OTP in {formatTime(timer)}</span>
                            ) : (
                                <button className="resend-btn" onClick={resendOtp}>
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            className="submit-btn"
                            onClick={() => handleVerifyOtpCall()}
                        >
                            Verify & Continue
                        </button>
                    </div>
                </IonModal>
            </IonContent>
            <IonLoading className={"loading_loader_spinner_container"} isOpen={loadingApiCall} message={"Loading..."}/>
        </IonPage>
    );
};

export default LoginPage;
