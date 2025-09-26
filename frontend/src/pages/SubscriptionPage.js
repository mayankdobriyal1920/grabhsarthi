import React, {useEffect} from "react";
import { IonPage, IonContent } from "@ionic/react";
import {checkmarkCircle, closeCircle} from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import {actionToGetAllSubscriptionPlanData} from "../apiHelper/CommonAction";
import useStore from "../zustand/useStore";
import {FacebookLoader} from "../components/FacebookLoader";

const SubscriptionPage = () => {

    const {allSubscriptionPlanData} = useStore();
    const {loading,subscriptionPlanData} = allSubscriptionPlanData;

    useEffect(()=>{
        actionToGetAllSubscriptionPlanData();
    },[])

    return (
        <IonPage>
            <IonContent className="subscription-page main-content-page">
                <div className="subscription-page-inner">
                    <div className="subscription_page_header_container">
                        <h1>Choose Your Plan</h1>
                        <p>Select the subscription that fits your journey best.</p>
                    </div>

                    <div className="plans_container">
                        {(loading) ?
                            <div className="plan_card">
                                <FacebookLoader type={"facebookStyle"} item={1}/>
                            </div>
                            :
                            <>
                                {subscriptionPlanData.map((plan, index) => (
                                    <div className="plan_card" key={index}>
                                        <h2 className="plan_title">{plan.plan_name}</h2>
                                        <p className="plan_price">{plan.price === 0 ? "Free" : `₹${plan.price}`}</p>
                                        <p className="plan_desc">{plan.plan_description}</p>

                                        <ul className="features_list">
                                            <li>
                                                <IonIcon
                                                    icon={plan.features.daily_tasks ? checkmarkCircle : closeCircle}
                                                    color={plan.features.daily_tasks ? "success" : "medium"}
                                                />
                                                Daily Task Tracking
                                            </li>
                                            <li>
                                                <IonIcon
                                                    icon={plan.features.community ? checkmarkCircle : closeCircle}
                                                    color={plan.features.community ? "success" : "medium"}
                                                />
                                                Community Access
                                            </li>
                                            <li>
                                                <IonIcon
                                                    icon={plan.features.video_library ? checkmarkCircle : closeCircle}
                                                    color={plan.features.video_library ? "success" : "medium"}
                                                />
                                                Video Library
                                            </li>
                                            <li>
                                                <IonIcon
                                                    icon={plan.features.live_classes ? checkmarkCircle : closeCircle}
                                                    color={plan.features.live_classes ? "success" : "medium"}
                                                />
                                                Live Classes
                                            </li>
                                        </ul>

                                        <button className="subscribe_button">
                                            {plan.price === 0 ? "Start Free" : "Subscribe"}
                                        </button>
                                    </div>
                                ))}
                            </>
                        }
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default SubscriptionPage;
