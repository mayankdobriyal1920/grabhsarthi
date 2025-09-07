import React, { useState } from "react";
import {
    IonContent,
    IonPage,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonToggle,
    IonButton, IonIcon, IonSelect, IonSelectOption, IonFooter,
} from "@ionic/react";
import {cameraOutline} from "ionicons/icons";

export default function AppSettingPage() {
    const [isPregnant, setIsPregnant] = useState(true);

    return (
        <IonPage>
            <IonContent fullscreen className="app-setting-page main-content-page">
                <div className="dash-wrap app-setting-page-dashboard">
                    {/* Profile Picture */}
                    <div className="profile-pic-section">
                        <img
                            src="https://i.pravatar.cc/150?img=12"
                            alt="profile"
                            className="profile-pic"
                        />
                        <button className="edit-pic-btn">
                            <IonIcon icon={cameraOutline} />
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="form-card">
                        <IonItem lines="none" className="form-item">
                            <IonLabel position="stacked">Full Name</IonLabel>
                            <IonInput placeholder="Enter your name" value="Mayank Dobriyal" />
                        </IonItem>

                        <IonItem lines="none" className="form-item">
                            <IonLabel position="stacked">Email</IonLabel>
                            <IonInput
                                type="email"
                                placeholder="Enter your email"
                                value="mayank@example.com"
                            />
                        </IonItem>

                        <IonItem lines="none" className="form-item">
                            <IonLabel position="stacked">Bio</IonLabel>
                            <IonTextarea placeholder="Tell us about yourself" />
                        </IonItem>

                        <IonItem lines="none" className="form-item">
                            <IonLabel position="stacked">LMP Date</IonLabel>
                            <IonInput type="date" value="2025-08-14" />
                        </IonItem>

                        <IonItem lines="none" className="form-item">
                            <IonLabel position="stacked">Pregnancy Status</IonLabel>
                            <IonSelect
                                interface="popover"
                                placeholder="Select Status"
                                value={isPregnant ? "Pregnant" : "TTC"}
                                onIonChange={(e) => setIsPregnant(e.detail.value === "Pregnant")}
                            >
                                <IonSelectOption value="TTC">TTC</IonSelectOption>
                                <IonSelectOption value="Pregnant">Pregnant</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </div>
                </div>
            </IonContent>
            <IonFooter>
                {/* Save Button */}
                <IonButton expand="block" className="save-btn">
                    Save
                </IonButton>
            </IonFooter>
        </IonPage>
    );
}
