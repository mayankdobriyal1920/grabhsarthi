import React, {useEffect} from "react";
import {IonPage, IonContent, IonIcon, IonModal} from "@ionic/react";
import {add, close, fitnessOutline, ribbonOutline, timerOutline} from "ionicons/icons";
import hydrationImg from "../theme/img/hydration_bottal_img.png";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData} from "../apiHelper/CommonAction";

export default function DailyTaskHydrationComponent() {
    const {commonActionSheetPopupData} = useStore();
    const {page} = commonActionSheetPopupData;

    const handleGoHomePage = () =>{
        actionToSetCommonActionSheetPopupData('');
    }

    useEffect(()=>{
        if(Capacitor.isNativePlatform() && page === 'daily-task-hydration'){
            StatusBar.setBackgroundColor({ color: '#8cc7d5' }).then(()=>{
                StatusBar.setStyle({ style:Style.Dark });
            });

            return ()=>{
                StatusBar.setBackgroundColor({ color: '#ffffff' }).then(()=>{
                    StatusBar.setStyle({ style:Style.Light });
                });
            }
        }
    },[page])


    return (
        <IonModal isOpen={page === 'daily-task-hydration'}>
            <IonContent fullscreen scrollEvents={true} className="pregnant-dashboard task_section_container_wrap hydration_main_container">
                <div className="header_for_task_section hydration">
                    <h1>{`Today's`} Hydration</h1>
                    <div className="session-info">
                        <div className="duration time_sec_c">
                            <IonIcon icon={timerOutline}/>
                            <span>3 of 8 Glasses</span>
                        </div>
                        <div className="duration count_sec">
                            <IonIcon icon={fitnessOutline}/>
                            <span>Daily Task</span>
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>
                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className={"hydrated_section_image"}>
                        <img src={hydrationImg} alt={'logo'}/>
                    </div>
                    <button className={"save_samvaad_button add_glass_hydration_button"} type="button">
                       <IonIcon icon={add}/> Add Glass
                    </button>
                    <div className={"samvaad_bottom_text"}>
                        Great job! Every sip nourishes you and your baby 💖
                    </div>
                    {/*/////// dashboard data ////*/}
                    <div className="samvaad_bottom_streek_section hydration">
                        <IonIcon icon={ribbonOutline} className="streak-icon" />
                        <span className="streak-text">Day 4 of 7 Hydration streak</span>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
