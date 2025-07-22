import React from 'react';
import {IonPage, IonContent, IonInput, IonButton, IonIcon} from '@ionic/react';
import logoImg from "../theme/img/app-logo.png";
import {phonePortraitOutline} from "ionicons/icons";

const LoginPage = () => {
    return (
        <IonPage>
            <IonContent fullscreen className="login-content">
                <div className="login-container">
                    {/* Tabs */}
                    <div className="login-tabs">
                        <span className="active-tab">Login</span>
                        <span className="inactive-tab">Signup</span>
                    </div>

                    {/* Logo */}
                    <div className="logo-wrapper">
                        <img src={logoImg} alt="logo" className="logo-img" />
                        <p className="logo-tagline">Your Womb Chariot</p>
                    </div>

                    {/* Input */}
                    <div className="input-wrapper">
                        <span className="input-icon">
                            <IonIcon icon={phonePortraitOutline}/>
                        </span>
                        <IonInput
                            type="text"
                            placeholder="Mobile or Email"
                            className="custom-input"
                        />
                    </div>

                    {/* Continue Button */}
                    <IonButton expand="block" className="continue-btn">
                        Continue
                    </IonButton>

                    {/* Partner login */}
                    <p className="partner-login">Login as Partner</p>

                    {/* Footer Links */}
                    <div className="footer-links">
                        <a href="#">Terms and Conditions</a>
                        <span>•</span>
                        <a href="#">Privacy Policy</a>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default LoginPage;
