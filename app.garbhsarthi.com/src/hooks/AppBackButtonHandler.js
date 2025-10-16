import { useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import useStore from "../zustand/useStore";
import { actionToSetCommonActionSheetPopupData } from "../apiHelper/CommonAction";
import useBlockBackButton from "./useBlockBackButton";

const AppBackButtonHandler = () => {
    useBlockBackButton();
    const { commonActionSheetPopupData } = useStore();

    // keep latest "is popup open?" value for the listener
    const isPopupOpenRef = useRef(!!commonActionSheetPopupData?.page);
    useEffect(() => {
        isPopupOpenRef.current = !!commonActionSheetPopupData?.page;
    }, [commonActionSheetPopupData]);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let sub;

        (async () => {
            sub = await CapacitorApp.addListener("backButton", async ({ canGoBack }) => {
                // 1) If your action sheet is open, close it and stop
                if (isPopupOpenRef.current) {
                    actionToSetCommonActionSheetPopupData("");
                    return; // default back is already blocked by having this listener
                }

                // 2) Block page back altogether at the app root if desired
                //    (no history to go back to)
                if (!canGoBack) {
                    // Choose one:
                    await CapacitorApp.minimizeApp(); // or CapacitorApp.exitApp()
                    return;
                }

                // 3) Otherwise, allow your own navigation
                window.history.back();
            });
        })();

        return () => {
            sub?.remove();
        };
    }, []);

    return null;
};

export default AppBackButtonHandler;
