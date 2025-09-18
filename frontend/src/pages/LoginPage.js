import React, { useState, useEffect, useRef } from "react";
import {
    IonPage,
    IonContent,
    IonIcon,
    IonModal, IonLoading
} from "@ionic/react";
import { phonePortraitOutline, closeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import loginPageSvg from "../theme/img/login_page_svg.svg";
import {
    actionToGenerateOtpForPhoneNumber,
    actionToGenerateVerifyOtpAndLoginSignupUser
} from "../apiHelper/CommonAction";
import useStore from "../zustand/useStore";

const LoginPage = () => {
    const history = useHistory();
    const {setUserAuthDetail} = useStore();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timer, setTimer] = useState(900); // 15 minutes
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [loadingApiCall, setLoadingApiCall] = useState(false);
    const [otpError, setOtpError] = useState(false);

    const inputRefs = useRef([]);
    const intervalRef = useRef(null);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

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
    const validatePhoneNumber = (num) => {
        const regex = /^[0-9]{10}$/; // adjust for your format
        return regex.test(num);
    };

    const handleSubmitSendOtp = () => {
        if (!validatePhoneNumber(phoneNumber)) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }
        if(intervalRef?.current){
            clearInterval(intervalRef?.current);
            setTimer(900);
        }
        setError("");
        setOtp(new Array(6).fill(""));
        setLoadingApiCall(true);
        actionToGenerateOtpForPhoneNumber(phoneNumber).then(()=>{
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
        actionToGenerateVerifyOtpAndLoginSignupUser(phoneNumber,otp).then((responseData)=>{
            setLoadingApiCall(false);
            if(responseData?.success === 1) {
                setUserAuthDetail(responseData?.userData);
                history.replace("/choose-role")
            }else{
                setOtpError(true);
            }
        })
    }

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
                          <IonIcon icon={phonePortraitOutline} />
                        </span>
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="custom-input"
                            value={phoneNumber}
                            onChange={(e) =>
                                setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
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
                    <div className="footer-links">
                        <a href="#">Terms and Conditions</a>
                        <span>•</span>
                        <a href="#">Privacy Policy</a>
                    </div>
                </div>

                {/* OTP Modal */}
                <IonModal
                    isOpen={showOtpModal}
                    onDidDismiss={() => setShowOtpModal(false)}
                    breakpoints={[0, 0.4]}
                    initialBreakpoint={0.4}
                    className="otp-modal"
                >
                    <div className="otp-container">
                        <button
                            className="close-btn"
                            onClick={() => setShowOtpModal(false)}>
                            <IonIcon icon={closeOutline} />
                        </button>

                        <h2 className="otp-title">Enter OTP</h2>
                        <p className="otp-subtitle">We’ve sent a 6-digit code to your phone</p>

                        <div className="otp-inputs">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    onChange={(e) => handleChange(e, i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    className="otp-box"
                                />
                            ))}
                        </div>
                        {(otpError) ?
                        <p className={"error-text"}>
                            Incorrected OTP Please enter valid otp!
                        </p>:''
                        }

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
