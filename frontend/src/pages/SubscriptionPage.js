import React, {useEffect} from "react";
import { IonPage, IonContent } from "@ionic/react";
import {checkmarkCircle, closeCircle} from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import {
    actionToCreateSubscriptionOrder,
    actionToGetAllSubscriptionPlanData, actionToGetUserSessionData,
    actionToVerifySubscriptionOrderPayment
} from "../apiHelper/CommonAction";
import useStore from "../zustand/useStore";
import {FacebookLoader} from "../components/FacebookLoader";
const RAZORPAY_KEY_ID='rzp_test_RMUbzO7yeqLk5B';

const SubscriptionPage = () => {

    const {allSubscriptionPlanData,userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;
    const {loading,subscriptionPlanData} = allSubscriptionPlanData;

    useEffect(()=>{
        actionToGetAllSubscriptionPlanData();
    },[])

    const handleSubscriptionPurchase = async (planId) => {
        try {
            const { data } = await actionToCreateSubscriptionOrder({subscription_plan_id:planId});

            const options = {
                key: RAZORPAY_KEY_ID, // replace with your actual Razorpay key
                amount: data.order.amount,
                currency: "INR",
                name: "GARBH SARTHI",
                description: data.order.description,
                order_id: data.order.id,
                prefill: {
                    name: userInfo?.profile?.full_name,
                    contact: userInfo.phone
                },
                handler: async (response) => {
                    try {
                        await actionToVerifySubscriptionOrderPayment(response);
                        actionToGetUserSessionData(true);
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        alert('Error verifying payment. Please contact support.');
                    }
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <IonPage>
            <IonContent className="subscription-page main-content-page">
                <div className="subscription-page-inner">
                    {(userInfo?.active_subscription) ?
                        <>
                            <div className="subscription_page_header_container">
                                <h1>Your Current Plan</h1>
                                <p>You have active subscription plan.</p>
                            </div>
                            <div className="plans_container">
                              <div className="active-plan-box plan_card">
                                <h3 className="plan_title">{userInfo.active_subscription.plan_name}</h3>
                                <p className="plan_price">
                                    {userInfo.active_subscription.total_amount === 0
                                        ? "Free"
                                        : `₹${userInfo.active_subscription.total_amount}`}
                                </p>
                                <p className="plan_duration">
                                    Valid Till: {new Date(userInfo.active_subscription.end_date).toLocaleDateString()}
                                </p>
                                <ul className="features_list">
                                    <li>
                                        <IonIcon
                                            icon={userInfo.active_subscription.features.daily_tasks ? checkmarkCircle : closeCircle}
                                            className={userInfo.active_subscription.features.daily_tasks ? "success_pl" : "medium"}
                                        />
                                        Daily Task Tracking
                                    </li>
                                    <li>
                                        <IonIcon
                                            icon={userInfo.active_subscription.features.community ? checkmarkCircle : closeCircle}
                                            className={userInfo.active_subscription.features.community ? "success_pl" : "medium"}
                                        />
                                        Community Access
                                    </li>
                                    <li>
                                        <IonIcon
                                            icon={userInfo.active_subscription.features.video_library ? checkmarkCircle : closeCircle}
                                            className={userInfo.active_subscription.features.video_library ? "success_pl" : "medium"}
                                        />
                                        Video Library
                                    </li>
                                    <li>
                                        <IonIcon
                                            icon={userInfo.active_subscription.features.live_classes ? checkmarkCircle : closeCircle}
                                            className={userInfo.active_subscription.features.live_classes ? "success_pl" : "medium"}
                                        />
                                        Live Classes
                                    </li>
                                </ul>
                                <button className="subscribe_button" disabled>
                                    Active Plan
                                </button>
                            </div>
                            </div>
                        </>
                        :
                        <>
                            <div className="subscription_page_header_container">
                                <h1>Choose Your Plan</h1>
                                <p>Select the subscription that fits your journey best.</p>
                            </div>
                            <div className="plans_container">
                                {(loading) ?
                                    <>
                                        <div className="plan_card">
                                            <FacebookLoader type={"facebookStyle"} item={1}/>
                                        </div>
                                        <div className="plan_card">
                                            <FacebookLoader type={"facebookStyle"} item={1}/>
                                        </div>
                                        <div className="plan_card">
                                            <FacebookLoader type={"facebookStyle"} item={1}/>
                                        </div>
                                    </>
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
                                                            className={plan.features.daily_tasks ? "success_pl" : "medium"}
                                                        />
                                                        Daily Task Tracking
                                                    </li>
                                                    <li>
                                                        <IonIcon
                                                            icon={plan.features.community ? checkmarkCircle : closeCircle}
                                                            className={plan.features.daily_tasks ? "success_pl" : "medium"}
                                                        />
                                                        Community Access
                                                    </li>
                                                    <li>
                                                        <IonIcon
                                                            icon={plan.features.video_library ? checkmarkCircle : closeCircle}
                                                            className={plan.features.video_library ? "success_pl" : "medium"}
                                                        />
                                                        Video Library
                                                    </li>
                                                    <li>
                                                        <IonIcon
                                                            icon={plan.features.live_classes ? checkmarkCircle : closeCircle}
                                                            className={plan.features.live_classes ? "success_pl" : "medium"}
                                                        />
                                                        Live Classes
                                                    </li>
                                                </ul>

                                                <button className="subscribe_button" onClick={()=>handleSubscriptionPurchase(plan?.id)}>
                                                    {plan.price === 0 ? "Active Plan" : "Subscribe"}
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </>
                    }

                    {(userInfo?.active_subscription?.plan_type === 'STANDARD') && (
                        <div className="plans_container">
                            {(loading) ?
                                <>
                                    <div className="plan_card">
                                        <FacebookLoader type={"facebookStyle"} item={1}/>
                                    </div>
                                    <div className="plan_card">
                                        <FacebookLoader type={"facebookStyle"} item={1}/>
                                    </div>
                                    <div className="plan_card">
                                        <FacebookLoader type={"facebookStyle"} item={1}/>
                                    </div>
                                </>
                                :
                                <>
                                    {subscriptionPlanData.map((plan, index) => (
                                        (plan.plan_type === 'PREMIUM') &&
                                        <div className="plan_card" key={index}>
                                            <h2 className="plan_title">{plan.plan_name}</h2>
                                            <p className="plan_price">{plan.price === 0 ? "Free" : `₹${plan.price}`}</p>
                                            <p className="plan_desc">{plan.plan_description}</p>

                                            <ul className="features_list">
                                                <li>
                                                    <IonIcon
                                                        icon={plan.features.daily_tasks ? checkmarkCircle : closeCircle}
                                                        className={plan.features.daily_tasks ? "success_pl" : "medium"}
                                                    />
                                                    Daily Task Tracking
                                                </li>
                                                <li>
                                                    <IonIcon
                                                        icon={plan.features.community ? checkmarkCircle : closeCircle}
                                                        className={plan.features.daily_tasks ? "success_pl" : "medium"}
                                                    />
                                                    Community Access
                                                </li>
                                                <li>
                                                    <IonIcon
                                                        icon={plan.features.video_library ? checkmarkCircle : closeCircle}
                                                        className={plan.features.video_library ? "success_pl" : "medium"}
                                                    />
                                                    Video Library
                                                </li>
                                                <li>
                                                    <IonIcon
                                                        icon={plan.features.live_classes ? checkmarkCircle : closeCircle}
                                                        className={plan.features.live_classes ? "success_pl" : "medium"}
                                                    />
                                                    Live Classes
                                                </li>
                                            </ul>

                                            <button className="subscribe_button" onClick={()=>handleSubscriptionPurchase(plan?.id)}>
                                                Upgrade Plan
                                            </button>
                                        </div>
                                    ))}
                                </>
                            }
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default SubscriptionPage;
