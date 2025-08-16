import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import logoImg from '../theme/img/app-logo.png';
import {useHistory} from "react-router-dom";

const WithoutLoginHomePage = () => {
    const history = useHistory();
    const handleStart = () => {
        history.replace('/login');
    };

    return (
        <IonPage>
            <IonContent className="welcome-page">
                <div className={"welcome-page-inner"}>
                    <div className={"welcome-logo"}>
                        <img
                            src={logoImg}
                            alt="GarbhSarthi Logo"
                        />
                    </div>

                    <h1 className="welcome-heading heading">Welcome to GarbhSarthi</h1>

                    <p className="welcome-tagline">
                        Your Companion Through Pregnancy
                    </p>

                    <button className="submit-btn" onClick={handleStart}>
                        START
                    </button>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default WithoutLoginHomePage;
