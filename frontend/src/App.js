import React, {useEffect, useState} from 'react';
import {setupIonicReact, IonApp, IonRouterOutlet, IonLoading} from '@ionic/react';
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/common-style.css';
import {IonReactRouter} from "@ionic/react-router";
import { Redirect, Route } from 'react-router';
import WithoutLoginHomePage from "./pages/WithoutLoginHomePage";
import LoginPage from "./pages/LoginPage";
import CreateRoleBasedFormPage from "./pages/CreateRoleBasedFormPage";
import AppEntryTabsPage from "./pages/AppEntryTabsPage";
import {Capacitor} from "@capacitor/core";
import {NavigationBar} from "@mauricewegner/capacitor-navigation-bar";
import {StatusBar, Style} from "@capacitor/status-bar";
import {actionToGetUserSessionData} from "./apiHelper/CommonAction";
import useStore from "./zustand/useStore";
import DailyTaskYogTaskComponent from "./components/DailyTaskYogTaskComponent";
import DailyTaskMeditationTaskComponent from "./components/DailyTaskMeditationTaskComponent";
import DailyTaskSamvaadComponent from "./components/DailyTaskSamvaadComponent";
import DailyTaskMantraComponent from "./components/DailyTaskMantraComponent";
import DailyTaskHydrationComponent from "./components/DailyTaskHydrationComponent";
import DailyTaskMoodComponent from "./components/DailyTaskMoodComponent";
import CommunityPostPage from "./pages/CommunityPostPage";

setupIonicReact();

const AppEnterMainPage = ({userRole}) => {
    return (
        <>
            <Route path="/dashboard" component={userRole ? AppEntryTabsPage : CreateRoleBasedFormPage} />
            <Redirect exact from="/" to="/dashboard" />
            <Route render={() => <Redirect to="/dashboard" />} />
        </>
    );
}

const PublicRoutes = () => {
    return (
        <>
            <Route path="/home" exact={true} component={WithoutLoginHomePage} />
            <Route path="/login" exact={true} component={LoginPage} />
            <Redirect exact from="/" to="/home" />
            <Route render={() => <Redirect to="/home" />} />
        </>
    );
};

const App = () => {
    const {userAuthDetail,userSession} = useStore();
    const {userInfo} = userAuthDetail;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

    useEffect(() => {
        actionToGetUserSessionData();
    }, []);

    useEffect(()=>{
        if(Capacitor.isNativePlatform()){
            NavigationBar.setColor({ color: '#ffffff' , darkButtons:true});
            StatusBar.setBackgroundColor({ color: '#ffffff' }).then(()=>{
                StatusBar.setStyle({ style:Style.Light });
            });
        }
    },[])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1000);
            if(document.querySelector('.mobile-contain-feed-events')){
                let leftSide = document.querySelector('.mobile-contain-feed-events')?.getBoundingClientRect()?.left;
                if(leftSide){
                    document.documentElement.style.setProperty('--event-page-left-side', `${leftSide}px`);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if(!isMobile){
        return (
            <RedirectToExternal url="https://garbhsarthi.com/" />
        );
    }else{
        return (
            <IonApp>
                {(!userSession?.loading) ?
                    <React.Fragment>
                        <IonReactRouter>
                            <IonRouterOutlet>
                                {userInfo?.id ? <AppEnterMainPage userRole={userInfo?.role}/> : <PublicRoutes/>}
                            </IonRouterOutlet>
                        </IonReactRouter>
                    </React.Fragment>:''
                }

                <IonLoading className={"loading_loader_spinner_container"} isOpen={userSession?.loading} message={"Loading..."}/>
                <CommunityPostPage/>
                <DailyTaskYogTaskComponent/>
                <DailyTaskMeditationTaskComponent/>
                <DailyTaskSamvaadComponent/>
                <DailyTaskMantraComponent/>
                <DailyTaskHydrationComponent/>
                <DailyTaskMoodComponent/>
            </IonApp>
        );
    }
}
// Component to redirect to external URL
function RedirectToExternal({ url }) {
    window.location.href = url;
    return null;
}

export default App;