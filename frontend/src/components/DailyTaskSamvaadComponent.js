import React, {useEffect, useState} from "react";
import {IonContent, IonIcon, IonModal} from "@ionic/react";
import pregSamvaadImg from "../theme/img/preg_samvaad.png";
import {close, ribbonOutline} from "ionicons/icons";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";
import useStore from "../zustand/useStore";
import {actionToSetCommonActionSheetPopupData} from "../apiHelper/CommonAction";

export default function DailyTaskSamvaadComponent() {
    const [babySamvaadText,setBabySamvaadText] = useState('');
    const {commonActionSheetPopupData} = useStore();
    const {page} = commonActionSheetPopupData;

    const handleGoHomePage = () =>{
        actionToSetCommonActionSheetPopupData('');
    }

    useEffect(()=>{
        if(Capacitor.isNativePlatform()){
            StatusBar.setBackgroundColor({ color: '#ff9380' }).then(()=>{
                StatusBar.setStyle({ style:Style.Dark });
            });

            return ()=>{
                StatusBar.setBackgroundColor({ color: '#ffffff' }).then(()=>{
                    StatusBar.setStyle({ style:Style.Light });
                });
            }
        }
    },[])

    return (
        <IonModal isOpen={page === 'daily-task-samvaad'}>
            <IonContent fullscreen scrollEvents={true} className="pregnant-dashboard task_section_container_wrap samvaad_main_container">
                <div className="header_for_task_section samvaad">
                    <h1>Garbh Samvaad</h1>
                    <div className="session-info-text-header">
                        <div className="duration time_sec_c">
                            {`Let's`} Strengthen your bond today
                        </div>
                    </div>
                    <div onClick={handleGoHomePage} className="session-info-end-session duration count_sec">
                        <IonIcon icon={close} />
                        <span>End Session</span>
                    </div>
                </div>
                <div className="dash-wrap pregnant-dashboard-wrap">
                    <div className={"card tasks card_for_garbh_samvaad"}>
                        <div className={"samvaad_inner_card"}>
                            <div className={"samvaad_inner_img_cont"}>
                                <img alt={"samvaad"} src={pregSamvaadImg}/>
                            </div>
                            <div className={"sanvaad_sweet_msz"}>
                                Share one sweet message with your baby
                            </div>
                            <textarea cols={1}
                                      className={"samvaad_text_input_area"}
                                      placeholder={"Write your message here (optional)"}
                                      onChange={(e)=>setBabySamvaadText(e.target.value)}
                                      value={babySamvaadText}
                            />
                            <button className={"save_samvaad_button"} type="button">
                                Press to complete task
                            </button>
                        </div>
                    </div>
                    <div className={"samvaad_bottom_text"}>
                        Beautiful! Every word of love nourishes your baby 💖
                    </div>

                    <div className="samvaad_bottom_streek_section">
                        <IonIcon icon={ribbonOutline} className="streak-icon" />
                        <span className="streak-text">Day 4 of 7 Garbh Samvaad streak</span>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}
