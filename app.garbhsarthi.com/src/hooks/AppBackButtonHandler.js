import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import useStore from "../zustand/useStore";
import { actionToSetCommonActionSheetPopupData } from "../apiHelper/CommonAction";

const AppBackButtonHandler = () => {
    const { commonActionSheetPopupData } = useStore();

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            const backButtonListener = CapacitorApp.addListener("backButton", async (event) => {
                // ✅ If popup is open, close it and block back navigation
                if (commonActionSheetPopupData?.page) {
                    actionToSetCommonActionSheetPopupData('');
                    // ✅ Stop default navigation
                    event.preventDefault?.();
                    return null;
                }
            });

            return () => {
                backButtonListener.remove(); // Cleanup
            };
        }
    }, [commonActionSheetPopupData]);

    return null;
};

export default AppBackButtonHandler;
