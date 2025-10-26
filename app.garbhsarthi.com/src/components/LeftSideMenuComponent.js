import React from 'react';
import {
    IonCol,
    IonContent,
    IonMenu,
    IonRow,
} from "@ionic/react";
import {useHistory, useLocation} from "react-router-dom";
import useStore from "../zustand/useStore";

const menuItems = [
    { label: 'Home', pathName:'/dashboard/home' },
    // { label: 'About Us', pathName:'/dashboard/about-us' },
    { label: 'Subscription', pathName: '/dashboard/subscription' },
    // { label: 'Contact Us', pathName:'/dashboard/contact-us' },
];

export default function LeftSideMenuComponent({pageId,setCurrentPath,menuRef,callFunctionToLogoutUser,menuId}){
    const history = useHistory();
    const {pathname} = useLocation();

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

    return (
        <IonMenu side="start" menuId={menuId} menuRef={menuRef} contentId={pageId}>
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
                                    <div className="user_full_contact">{userInfo?.email}</div>
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
    )
}