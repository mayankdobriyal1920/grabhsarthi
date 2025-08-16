import React, { useState, useEffect, useRef } from 'react';
import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonModal,
    IonContent
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
    ellipsisHorizontal
} from 'ionicons/icons';

const AppEntryTabsPage = () => {
    const [currentPath, setCurrentPath] = useState('/dashboard/home');
    const [showMoreSheet, setShowMoreSheet] = useState(false);

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
                <Route exact path="/dashboard/home" component={PregnantDashboardPage} />
                <Redirect exact from="/dashboard" to="/dashboard/home" />
            </IonRouterOutlet>

            {/* Tab Bar only shows on mobile */}
            <IonTabBar slot="bottom" className="custom-tabbar main-tab-bar">
                <IonTabButton
                    tab="home"
                    onClick={() => setCurrentPath('/dashboard/home')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/home'}
                >
                    <IonIcon icon={currentPath === '/dashboard/home' ? home : homeOutline} />
                    <IonLabel>Home</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="classes"
                    onClick={() => setCurrentPath('/dashboard/classes')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/classes'}
                >
                    <IonIcon icon={currentPath === '/dashboard/classes' ? newspaper : newspaperOutline} />
                    <IonLabel>Classes</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="tracker"
                    onClick={() => setCurrentPath('/dashboard/tracker')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/tracker'}
                >
                    <IonIcon icon={currentPath === '/dashboard/tracker' ? fitness : fitnessOutline} />
                    <IonLabel>Tracker</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="community"
                    onClick={() => setCurrentPath('/dashboard/community')}
                    className="custom-ripple-color"
                    selected={currentPath === '/dashboard/community'}
                >
                    <IonIcon icon={currentPath === '/dashboard/community' ? people : peopleOutline} />
                    <IonLabel>Community</IonLabel>
                </IonTabButton>

                <IonTabButton
                    tab="more"
                    className={`custom-ripple-color ${showMoreSheet ? 'tab-selected' : ''}`}
                    onClick={callFunctionToOpenShowMoreSheet}
                >
                    <IonIcon icon={ellipsisHorizontal} />
                    <IonLabel>More</IonLabel>

                    <IonModal
                        isOpen={showMoreSheet}
                        onDidDismiss={() => setShowMoreSheet(false)}
                        breakpoints={[0, 0.2]}
                        initialBreakpoint={0.2}
                        className="more-sheet-modal"
                    >
                        <IonContent className="ion-padding">
                            <div className="more-sheet-grid">
                                <div onClick={() => gotToPage('/dashboard/settings')} className={`more-sheet-item`}>
                                    <div className="more-tile">
                                        <IonIcon icon={settingsOutline} />
                                    </div>
                                    <span>Settings</span>
                                </div>
                                {/* Add other "more" items as needed */}
                            </div>
                        </IonContent>
                    </IonModal>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default AppEntryTabsPage;
