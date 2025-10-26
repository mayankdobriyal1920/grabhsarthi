import React, {useState, useEffect, useRef} from 'react';
import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonPage, useIonAlert, IonLoading
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
    actionToGetCommunityAllPostData, actionToGetDailyTasksByUserId, actionToLogoutUserSession
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
import AppBackButtonHandler from "../hooks/AppBackButtonHandler";
import LeftSideMenuComponent from "../components/LeftSideMenuComponent";

const HIDE_AFTER_SCROLLING_DOWN = 24;  // px to hide
const SHOW_AFTER_SCROLLING_UP   = 80;  // px to show
const TOP_SAFE_ZONE             = 8;   // always show near top
const AppEntryTabsPage = () => {
    const [currentPath, setCurrentPath] = useState('/dashboard/home');
    const menuRef = React.useRef(null);
    const {userAuthDetail,commonActionSheetPopupData} = useStore();
    const {userInfo} = userAuthDetail;
    const postedSingleRef = useRef(false);
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [presentAlert] = useIonAlert();
    const [userLogoutLoading, setUserLogoutLoading] = useState(false);


    //////// FOR SCROLL HIDE ////////////
    const lastScrollTop = useRef(0);
    const [hideHeader, setHideHeader] = useState(false);
    const anchorRef = useRef(0);           // reference y for next decision
    const timeoutRef = useRef(null); // debounce holder
    const tickingRef = useRef(false);      // rAF throttle

    // optional: avoid redundant state updates
    const setHiddenSafely = (next) => {
        setHideHeader(prev => (prev !== next ? next : prev));
    };

    const handleScroll = (event) => {
        const raw = event.detail?.scrollTop ?? 0;
        const y = raw < 0 ? 0 : raw;

        // --- small debounce so we don't react to touch jitter
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            // --- throttle decisions to one per frame
            if (tickingRef.current) return;
            tickingRef.current = true;

            requestAnimationFrame(() => {
                // Always show when very close to top (nice UX)
                if (y <= TOP_SAFE_ZONE) {
                    setHiddenSafely(false);
                    anchorRef.current = y;
                    lastScrollTop.current = y;
                    tickingRef.current = false;
                    return;
                }

                if (!hideHeader) {
                    // user scrolling DOWN enough? -> hide
                    if (y - anchorRef.current > HIDE_AFTER_SCROLLING_DOWN) {
                        setHiddenSafely(true);
                        anchorRef.current = y; // reset anchor at action point
                    }
                } else {
                    // user scrolling UP enough? -> show
                    if (anchorRef.current - y > SHOW_AFTER_SCROLLING_UP) {
                        setHiddenSafely(false);
                        anchorRef.current = y; // reset anchor at action point
                    }
                }

                lastScrollTop.current = y;
                tickingRef.current = false;
            });
        }, 60); // debounce window in ms (40–80 feels good)
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    //////// FOR SCROLL HIDE ////////////

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

    const callFunctionToLogoutUser = ()=>{
        presentAlert({
            header: 'Confirm Logout',
            cssClass:"confirm_alert_custom",
            message: 'Are you sure you want to log out?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Yes',
                    handler: () => {
                        actionToLogoutUserSession(setUserLogoutLoading);
                    },
                },
            ],
        });
    }

    const renderHeaderPage = (panelSubHeader = null) => (
        <HeaderAfterLoginComponent
            menuRef={menuRef}
            currentPath={currentPath}
            callFunctionToLogoutUser={callFunctionToLogoutUser}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            panelSubHeader={panelSubHeader}
            setCurrentPath={setCurrentPath}
            menuId="main-menu"
            hideHeader={hideHeader}
        />
    );

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/dashboard/" render={() => (
                    <IonPage>
                        {/*///////// LEFT SIDE MOBILE MENU /////////*/}
                        <LeftSideMenuComponent
                            menuOpen={menuOpen}
                            setMenuOpen={setMenuOpen}
                            setCurrentPath={setCurrentPath}
                            menuRef={menuRef}
                            callFunctionToLogoutUser={callFunctionToLogoutUser}
                            menuId="main-menu"
                            pageId="main-menu-content"/>
                        {/*///////// LEFT SIDE MOBILE MENU /////////*/}
                        <IonRouterOutlet id="main-menu-content">
                            <Route exact path="/dashboard/home" render={()=>(
                                <>
                                    {userInfo?.role === 3 ?
                                        <TTCUserDashboardPage renderHeaderPage={renderHeaderPage}/>
                                        :
                                        <PregnantDashboardPage renderHeaderPage={renderHeaderPage}/>
                                    }
                                </>
                            )} />
                            <Route exact path="/dashboard/tracker" render={()=>(
                                <>
                                    {userInfo?.role === 3 ?
                                        <OvulationTrackerPage renderHeaderPage={renderHeaderPage}/>
                                        :
                                        <BabyTrackerPageForPregnantPage renderHeaderPage={renderHeaderPage}/>
                                    }
                                </>
                            )} />
                            <Route exact path="/dashboard/classes" render={()=>(
                                <ClassesPage renderHeaderPage={renderHeaderPage}/>
                            )}/>

                            <Route exact path="/dashboard/community" render={()=>(
                                <CommunityPage handleScroll={handleScroll} renderHeaderPage={renderHeaderPage}/>
                            )} />
                            <Route exact path="/dashboard/settings" render={()=>(
                                <AppSettingPage renderHeaderPage={renderHeaderPage}/>
                            )}/>
                            <Route exact path="/dashboard/subscription" render={()=>(
                                <SubscriptionPage renderHeaderPage={renderHeaderPage}/>
                            )}/>
                            <Redirect exact from="/dashboard" to="/dashboard/home" />
                        </IonRouterOutlet>
                        {/*//////// HANDLE BACK BUTTON ////////////*/}
                        <AppBackButtonHandler/>
                        {/*//////// HANDLE BACK BUTTON ////////////*/}
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
                        <IonLoading className={"loading_loader_spinner_container"} isOpen={userLogoutLoading} message={"Loading..."}/>
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
