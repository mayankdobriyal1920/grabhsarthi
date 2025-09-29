import React, {useState, useEffect, useRef} from 'react';
import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonPage
} from '@ionic/react';
import { Route, Redirect, useLocation } from 'react-router-dom';

// Import your pages/components
import PregnantDashboardPage from './PregnantDashboardPage';

// Import icons
import {
    home,
    homeOutline,
    fitness,
    fitnessOutline,
    people,
    peopleOutline,
    settingsOutline, settings, videocamOutline, videocam
} from 'ionicons/icons';
import HeaderAfterLoginComponent from "../components/HeaderAfterLoginComponent";
import useStore from "../zustand/useStore";
import TTCUserDashboardPage from "./TTCUserDashboardPage";
import OvulationTrackerPage from "./OvulationTrackerPage";
import CommunityPage from "./CommunityPage";
import BabyTrackerPageForPregnantPage from "./BabyTrackerPageForPregnantPage";
import ClassesPage from "./ClassesPage";
import AppSettingPage from "./AppSettingPage";
import {
    actionToConnectSocketServer,
    actionToGetAllScheduledLiveClass,
    actionToGetCommunityAllPostData, actionToGetDailyTasksByUserId
} from "../apiHelper/CommonAction";
import SubscriptionPage from "./SubscriptionPage";
import CommunityPostPage from "./CommunityPostPage";
import DailyTaskYogTaskComponent from "../components/DailyTaskYogTaskComponent";
import DailyTaskMeditationTaskComponent from "../components/DailyTaskMeditationTaskComponent";
import DailyTaskSamvaadComponent from "../components/DailyTaskSamvaadComponent";
import DailyTaskMantraComponent from "../components/DailyTaskMantraComponent";
import DailyTaskHydrationComponent from "../components/DailyTaskHydrationComponent";
import DailyTaskMoodComponent from "../components/DailyTaskMoodComponent";
import VideoLibraryCategoryVideosComponent from "../components/VideoLiberaryCategoryVideosComponent";
import DailyTaskAffirmationComponent from "../components/DailyTaskAffirmationComponent";
import {Capacitor} from "@capacitor/core";
import {NavigationBar} from "@mauricewegner/capacitor-navigation-bar";
import {StatusBar, Style} from "@capacitor/status-bar";

const AppEntryTabsPage = () => {
    const [currentPath, setCurrentPath] = useState('/dashboard/home');
    const menuRef = React.useRef(null);
    const {userAuthDetail,commonActionSheetPopupData} = useStore();
    const {userInfo} = userAuthDetail;
    const postedSingleRef = useRef(false);
    const { pathname } = useLocation();
    const lastScrollTop = useRef(0);
    const [hideHeader, setHideHeader] = useState(false);

    useEffect(() => {
        setCurrentPath(pathname);
    }, [pathname]);

    useEffect(() => {
        if(!postedSingleRef?.current) {
            actionToGetCommunityAllPostData();
            actionToGetAllScheduledLiveClass();
            actionToGetDailyTasksByUserId();
            actionToConnectSocketServer();
            postedSingleRef.current = true;
        }
    }, []);

    useEffect(() => {
        setHideHeader(false)
    }, [pathname]);

    const handleScroll = (event) => {
        const scrollTop = event.detail.scrollTop ?? 0;
        const newScrollTop = scrollTop < 0 ? 0 : scrollTop;

        if (newScrollTop > lastScrollTop.current) {
            setHideHeader(true);
        } else if (newScrollTop !== undefined && lastScrollTop.current !== undefined && newScrollTop < lastScrollTop.current) {
            setHideHeader(false);
        }

        lastScrollTop.current = newScrollTop;
    }

    useEffect(() => {
       if(!commonActionSheetPopupData?.page){
           actionToGetDailyTasksByUserId();
           if(Capacitor.isNativePlatform()){
               NavigationBar.setColor({ color: '#ffffff' , darkButtons:true});
               StatusBar.setBackgroundColor({ color: '#ffffff' }).then(()=>{
                   StatusBar.setStyle({ style:Style.Light });
               });
           }
       }
    }, [commonActionSheetPopupData]);

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/dashboard/" render={() => (
                    <IonPage>
                        {/* Common header always visible */}
                        <HeaderAfterLoginComponent menuRef={menuRef} currentPath={currentPath} hideHeader={hideHeader} setCurrentPath={setCurrentPath} pageId={"main-menu-content"} />
                        {/* Nested outlet for tab pages */}
                        <IonRouterOutlet id="main-menu-content">
                            <Route exact path="/dashboard/home" component={
                                userInfo?.role === 3 ? TTCUserDashboardPage : PregnantDashboardPage
                            } />
                            <Route exact path="/dashboard/tracker" component={
                                userInfo?.role === 3 ? OvulationTrackerPage : BabyTrackerPageForPregnantPage
                            } />
                            <Route exact path="/dashboard/classes" component={ClassesPage} />
                            <Route exact path="/dashboard/community" render={()=>(
                                <CommunityPage handleScroll={handleScroll}/>
                            )} />
                            <Route exact path="/dashboard/settings" component={AppSettingPage} />
                            <Route exact path="/dashboard/subscription" component={SubscriptionPage} />
                            <Redirect exact from="/dashboard" to="/dashboard/home" />
                        </IonRouterOutlet>
                        {commonActionSheetPopupData?.page === "community-post" && (
                            <CommunityPostPage/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-yoga" && (
                            <DailyTaskYogTaskComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-meditation" && (
                            <DailyTaskMeditationTaskComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-samvaad" && (
                            <DailyTaskSamvaadComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-mantra" && (
                            <DailyTaskMantraComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-hydration" && (
                            <DailyTaskHydrationComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-mood" && (
                            <DailyTaskMoodComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "daily-task-affirmation" && (
                            <DailyTaskAffirmationComponent/>
                        )}
                        {commonActionSheetPopupData?.page === "video-page" && (
                            <VideoLibraryCategoryVideosComponent/>
                        )}
                    </IonPage>
                )} />
            </IonRouterOutlet>

            {/* Tab Bar only shows on mobile */}
            <IonTabBar slot="bottom" className="custom-tabbar main-tab-bar">
                <IonTabButton
                    tab="home"
                    href="/dashboard/home"
                    onClick={() => setCurrentPath('/dashboard/home')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/home'}
                >
                    <IonIcon icon={currentPath === '/dashboard/home' ? home : homeOutline} />
                    <IonLabel>Home</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="classes"
                    href="/dashboard/classes"
                    onClick={() => setCurrentPath('/dashboard/classes')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/classes'}
                >
                    <IonIcon icon={currentPath === '/dashboard/classes' ? videocam : videocamOutline} />
                    <IonLabel>Classes</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="tracker"
                    href="/dashboard/tracker"
                    onClick={() => setCurrentPath('/dashboard/tracker')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/tracker'}
                >
                    <IonIcon icon={currentPath === '/dashboard/tracker' ? fitness : fitnessOutline} />
                    <IonLabel>Tracker</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="community"
                    href="/dashboard/community"
                    onClick={() => setCurrentPath('/dashboard/community')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/community'}
                >
                    <IonIcon icon={currentPath === '/dashboard/community' ? people : peopleOutline} />
                    <IonLabel>Community</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="settings"
                    href="/dashboard/settings"
                    onClick={() => setCurrentPath('/dashboard/settings')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/settings'}
                >
                    <IonIcon icon={currentPath === '/dashboard/settings' ? settings : settingsOutline} />
                    <IonLabel>Settings</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default AppEntryTabsPage;
