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
    ellipsisHorizontal
} from 'ionicons/icons';
import HeaderAfterLoginComponent from "../components/HeaderAfterLoginComponent";
import useStore from "../zustand/useStore";
import TTCUserDashboardPage from "./TTCUserDashboardPage";

const AppEntryTabsPage = () => {
    const [currentPath, setCurrentPath] = useState('/dashboard/home');
    const [showMoreSheet, setShowMoreSheet] = useState(false);
    const lastScrollTop = React.useRef(0);
    const menuRef = React.useRef(null);
    const [hideHeader, setHideHeader] = useState(false);
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

    const handleScroll = (event) => {
        // const scrollTop = event.detail.scrollTop ?? 0;
        // const newScrollTop = scrollTop < 0 ? 0 : scrollTop;
        //
        // if (newScrollTop > lastScrollTop.current) {
        //     setHideHeader(true);
        // } else if (newScrollTop < lastScrollTop.current) {
        //     setHideHeader(false);
        // }
        //
        // lastScrollTop.current = newScrollTop;
    }

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/dashboard/" render={() => (
                    <IonPage>
                        {/* Common header always visible */}
                        <HeaderAfterLoginComponent menuRef={menuRef} currentPath={currentPath} setCurrentPath={setCurrentPath} hideHeader={hideHeader} pageId={"main-menu-content"} />
                        {/* Nested outlet for tab pages */}
                        <IonRouterOutlet id="main-menu-content">
                            <Route exact path="/dashboard/home" render={()=>(
                                <>
                                    {(userInfo?.role === 1) ?
                                        <TTCUserDashboardPage handleScroll={handleScroll} />
                                        :
                                        <PregnantDashboardPage handleScroll={handleScroll} />
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
