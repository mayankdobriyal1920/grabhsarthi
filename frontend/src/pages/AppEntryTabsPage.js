import React, { useState, useEffect } from 'react';
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

const AppEntryTabsPage = () => {
    const [currentPath, setCurrentPath] = useState('/dashboard/home');
    const menuRef = React.useRef(null);
    const {userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;
    const { pathname } = useLocation();

    useEffect(() => {
        setCurrentPath(pathname);
    }, [pathname]);

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/dashboard/" render={() => (
                    <IonPage>
                        {/* Common header always visible */}
                        <HeaderAfterLoginComponent menuRef={menuRef} currentPath={currentPath} setCurrentPath={setCurrentPath} pageId={"main-menu-content"} />
                        {/* Nested outlet for tab pages */}
                        <IonRouterOutlet id="main-menu-content">
                            <Route exact path="/dashboard/home" component={
                                userInfo?.role === 3 ? TTCUserDashboardPage : PregnantDashboardPage
                               } />
                            <Route exact path="/dashboard/tracker" component={
                                userInfo?.role === 3 ? OvulationTrackerPage : BabyTrackerPageForPregnantPage
                            } />
                            <Route exact path="/dashboard/classes" component={ClassesPage} />
                            <Route exact path="/dashboard/community" component={CommunityPage} />
                            <Route exact path="/dashboard/settings" component={AppSettingPage} />
                            <Redirect exact from="/dashboard" to="/dashboard/home" />
                        </IonRouterOutlet>
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
