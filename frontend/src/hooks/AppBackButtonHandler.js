import useBlockBackButton from "../hooks/useBlockBackButton";
import {useEffect} from "react";
import {App as CapacitorApp} from "@capacitor/app";
import {Capacitor} from "@capacitor/core";
import {useIonAlert} from "@ionic/react";

const AppBackButtonHandler = () => {
    useBlockBackButton();
    const [presentAlert] = useIonAlert();

    useEffect(() => {
        if(Capacitor.isNativePlatform()) {
            const backButtonListener = CapacitorApp.addListener("backButton", async (data) => {
                if (!data.canGoBack) {
                    presentAlert({
                        header: 'Are you sure?',
                        cssClass: 'custom_site_alert_toast',
                        message: 'You want to exit the app.',
                        buttons: [
                            {text: 'Cancel', role: 'cancel'},
                            {text: 'Exit', role: 'confirm', handler: () => CapacitorApp.exitApp()},
                        ],
                    });
                }
            });

            return () => {
                backButtonListener.remove(); // Ensure cleanup on unmount
            };
        }
    }, []);

    return null;
};

export default AppBackButtonHandler;