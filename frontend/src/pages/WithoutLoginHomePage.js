import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import logoImg from '../theme/img/app-logo.png';

const WithoutLoginHomePage = () => {
    const handleStart = () => {
        console.log('Start button clicked');
    };

    return (
        <IonPage>
            <IonContent className="welcome-page">
                <div className={"welcome-page-inner"}>
                    <img
                        src={logoImg}
                        alt="GarbhSarthi Logo"
                        className="welcome-logo"
                    />

                    <h1 className="welcome-heading">Welcome to GarbhSarthi</h1>

                    <p className="welcome-tagline">
                        Your Companion Through Pregnancy
                    </p>

                    <button className="start-button" onClick={handleStart}>
                        START
                    </button>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default WithoutLoginHomePage;
