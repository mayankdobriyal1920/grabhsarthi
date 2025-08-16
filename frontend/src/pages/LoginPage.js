import React from 'react';
import {IonPage, IonContent, IonIcon} from '@ionic/react';
import logoImg from "../theme/img/app-full-logo.png";
import {phonePortraitOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";

const LoginPage = () => {
    const history = useHistory();
    const goToPage = (page)=>{
        history.replace(page);
    }

    return (
        <IonPage>
            <IonContent fullscreen className="login-content">
                <div className="login-container">

                    {/* Logo */}
                    <div className="logo-wrapper">
                        <img src={logoImg} alt="logo" className="logo-img" />
                    </div>

                    {/* Input */}
                    <div className="input-wrapper card">
                        <span className="input-icon">
                            <IonIcon icon={phonePortraitOutline}/>
                        </span>
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="custom-input"
                        />
                    </div>

                    {/* Continue Button */}
                    <button onClick={()=>goToPage('/choose-role')} className="start-button submit-btn">
                        Get OTP
                    </button>

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
