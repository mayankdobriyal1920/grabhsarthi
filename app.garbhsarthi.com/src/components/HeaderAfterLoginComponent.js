import React,{useEffect} from 'react';
import {
    IonButton, IonButtons,
    IonHeader,
    IonIcon,
    IonToolbar,
} from "@ionic/react";
import {logOut, menuOutline} from "ionicons/icons";
import {useHistory, useLocation} from "react-router-dom";
import appLogo from "../theme/img/app-small-logo.png";
import useStore from "../zustand/useStore";

export default function HeaderAfterLoginComponent({
                                                      menuRef,
                                                      currentPath,
                                                      hideHeader,
                                                      callFunctionToLogoutUser,
                                                      menuOpen,
                                                      setMenuOpen
                                                  }){

    const {userAuthDetail} = useStore();
    const {userInfo} = userAuthDetail;

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

    const toggleMenu = () => {
        const menu = menuRef.current; // pass this ref down via props
        if (!menu) return;
        menu.isOpen().then((open) => (open ? menu.close() : menu.open()));
    };

    return (
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
                            <div className={`page_name_header_online ${userInfo?.role === 2 ? 'pregnant' : 'ttc'}`}>
                                {userInfo?.role === 2 ? 'Pregnant' : 'TTC'}
                            </div>
                        </div>
                    </IonButton>
                </IonButtons>
                <IonButtons slot="end" className="with_login-icons">
                    <IonButton onClick={()=>callFunctionToLogoutUser()} className="header_button">
                        <div className="notification-icon">
                            <IonIcon icon={logOut}/>
                        </div>
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    )
}