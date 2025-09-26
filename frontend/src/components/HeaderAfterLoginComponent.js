import React,{useState,useEffect} from 'react';
import {
    IonButton, IonButtons,
    IonCol,
    IonContent,
    IonHeader,
    IonIcon, IonLoading,
    IonMenu,
    IonRow,
    IonToolbar,
    useIonAlert
} from "@ionic/react";
import {menuOutline, notifications} from "ionicons/icons";
import {useHistory, useLocation} from "react-router-dom";
import appLogo from "../theme/img/app-small-logo.png";
import {actionToLogoutUserSession} from "../apiHelper/CommonAction";
import useStore from "../zustand/useStore";

const menuItems = [
    { label: 'Home', pathName:'/dashboard/home' },
    { label: 'About Us', pathName:'/dashboard/about-us' },
    { label: 'Subscription', pathName: '/dashboard/subscription' },
    { label: 'Contact Us', pathName:'/dashboard/contact-us' },
];
export default function HeaderAfterLoginComponent({pageId,menuRef,currentPath,hideHeader,setCurrentPath}){
    const [menuOpen, setMenuOpen] = useState(false);
    const [userLogoutLoading, setUserLogoutLoading] = useState(false);
    const history = useHistory();
    const {pathname} = useLocation();
    const [presentAlert] = useIonAlert();
    const {userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;

    const goToPage =(page)=>{
        const menu = menuRef.current;
        history.replace(page);
        setCurrentPath(page);
        if (menu) {
            menu?.close();
        }
    }

    useEffect(() => {
        // Setup menu event listeners when component mounts
        const setupMenuListeners = () => {
            const menu = document.querySelector('ion-menu');
            if (menu) {
                menuRef.current = menu;
                menu.addEventListener('ionDidOpen', handleMenuOpen);
                menu.addEventListener('ionDidClose', handleMenuClose);
            }
        }

        const handleMenuOpen = () => setMenuOpen(true);
        const handleMenuClose = () => setMenuOpen(false);

        // Ionic components might not be ready immediately
        const timer = setTimeout(setupMenuListeners, 300);

        return () => {
            clearTimeout(timer);
            if (menuRef.current) {
                menuRef.current.removeEventListener('ionDidOpen', handleMenuOpen);
                menuRef.current.removeEventListener('ionDidClose', handleMenuClose);
            }
        };
    }, []);

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

    const toggleMenu = () => {
        const menu = menuRef.current;
        if (menu) {
            menuOpen ? menu.close() : menu.open();
        }
    };

    React.useLayoutEffect(() => {
        setTimeout(()=>{
            const tabBarEl = document.querySelector('.main_app_header');
            if (tabBarEl) {
                const tabHeight = tabBarEl.getBoundingClientRect().height;
                document.documentElement.style.setProperty('--header-bar-height', `${tabHeight}px`);
            }
        })
    }, []);

    return (
        <>
            <IonMenu side="start" menuId="main-menu" contentId={pageId}>
                <IonContent>
                    <div className="with_login-mobile-menu">
                        {/* Close button at top of menu */}
                        <div className="with_login-menu-item">
                            <IonRow className={"with_login-menu-item-header-row"}>
                                <IonCol size="3">
                                    <div className="profile-avatar">
                                        <div className="avatar-pill">{userInfo?.profile?.full_name?.substring(0,1)}</div>
                                    </div>
                                </IonCol>
                                <IonCol size="9">
                                    <div className={"user_full_info"}>
                                        <div className="user_full_name">{userInfo?.profile?.full_name}</div>
                                        <div className="user_full_contact">+91-{userInfo?.phone}</div>
                                    </div>
                                </IonCol>
                            </IonRow>
                        </div>

                        {menuItems.map((item, index) => (
                            <div key={index} className="menu-section">
                                <div
                                    onClick={() => {
                                        if (item.pathName) {
                                            goToPage(item.pathName);
                                        }
                                    }}
                                    className={`with_login-menu-item menu-names ${
                                        pathname === item?.pathName ? 'active' : ''
                                    }`}
                                >
                                    <span>{item.label}</span>
                                </div>

                                {item.children && (
                                    <div className="submenu">
                                        {item.children.map((child, childIndex) => (
                                            <div
                                                key={childIndex}
                                                onClick={() => goToPage(child.pathName)}
                                                className={`with_login-menu-item submenu-item ${
                                                    pathname === child?.pathName ? 'active' : ''
                                                }`}
                                            >
                                                <span>{child.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="menu-section">
                            <div
                                onClick={() => callFunctionToLogoutUser()}
                                className={`with_login-menu-item menu-names`}>
                                <span>Log Out</span>
                            </div>
                        </div>
                        <div className="with_login-menu-item version_no_section">
                            <div className={"version_no_section"}>Version 0.0.1</div>
                        </div>
                    </div>
                </IonContent>
            </IonMenu>
            <IonHeader className={`with_login-header main_app_header ${hideHeader ? 'hide_element' : ''}`}>
                <IonToolbar className="with_login-toolbar">
                    <IonButtons slot="start">
                        <IonButton
                            onClick={toggleMenu}
                            className={`with_login-menu-button ${menuOpen ? 'open' : ''}`}>
                            <div className="profile-avatar with-app-logo">
                                <img alt={'appLogo'} src={appLogo}/>
                                <IonIcon icon={menuOutline} className="avatar-icon"/>
                            </div>
                            <div className={"page_name_header_container"}>
                                <div className={"page_name_header"}>{currentPath?.split('/').pop()?.charAt(0)?.toUpperCase() + currentPath?.split('/').pop()?.slice(1)}</div>
                                <div className={"page_name_header_online"}>6,789 Online</div>
                            </div>
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="end" className="with_login-icons">
                        <IonButton className="header_button">
                            <div className="notification-icon">
                                <IonIcon icon={notifications}/>
                                <span className="notification-badge">2</span>
                            </div>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonLoading className={"loading_loader_spinner_container"} isOpen={userLogoutLoading} message={"Loading..."}/>
            </IonHeader>
        </>
    )
}