import React, { useState, useEffect } from 'react';
import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonModal,
    IonContent, IonPage
} from '@ionic/react';
import { Route, Redirect, useLocation, useHistory } from 'react-router-dom';

// Import your pages/components
import PregnantDashboardPage from './PregnantDashboardPage';

// Import icons
import {
    home,
    homeOutline,
    newspaper,
    newspaperOutline,
    fitness,
    fitnessOutline,
    people,
    peopleOutline,
    settingsOutline,
    ellipsisHorizontal, settingsSharp, settings
} from 'ionicons/icons';
import HeaderAfterLoginComponent from "../components/HeaderAfterLoginComponent";
import useStore from "../zustand/useStore";
import TTCUserDashboardPage from "./TTCUserDashboardPage";
import OvulationTrackerPage from "../components/OvulationTrackerPage";

const AppEntryTabsPage = () => {
    const [currentPath, setCurrentPath] = useState('/dashboard/home');
    const [showMoreSheet, setShowMoreSheet] = useState(false);
    const menuRef = React.useRef(null);
    const {userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;
    const history = useHistory();
    const { pathname } = useLocation();

    useEffect(() => {
        setCurrentPath(pathname);
    }, [pathname]);

    const gotToPage = (path) => {
        history.replace(path);
        setShowMoreSheet(false);
    };

    const callFunctionToOpenShowMoreSheet = () => {
        const tabBarEl = document.querySelector('.main-tab-bar');
        if (tabBarEl) {
            const tabHeight = tabBarEl.getBoundingClientRect().height;
            document.documentElement.style.setProperty('--tab-bar-height', `${tabHeight}px`);
        }
        setShowMoreSheet(!showMoreSheet);
    };

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/dashboard/" render={() => (
                    <IonPage>
                        {/* Common header always visible */}
                        <HeaderAfterLoginComponent menuRef={menuRef} currentPath={currentPath} setCurrentPath={setCurrentPath} pageId={"main-menu-content"} />
                        {/* Nested outlet for tab pages */}
                        <IonRouterOutlet id="main-menu-content">
                            <Route exact path="/dashboard/home" render={()=>(
                                <>
                                    {(userInfo?.role === 3) ?
                                        <TTCUserDashboardPage />
                                        :
                                        <PregnantDashboardPage />
                                    }
                                </>
                            )} />
                            <Route exact path="/dashboard/tracker" render={()=>(
                                <>
                                    {(userInfo?.role === 3) ?
                                        <OvulationTrackerPage />
                                        :
                                        <OvulationTrackerPage />
                                    }
                                </>
                            )} />
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
                    <IonIcon icon={currentPath === '/dashboard/classes' ? newspaper : newspaperOutline} />
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
