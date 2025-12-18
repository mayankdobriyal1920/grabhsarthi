import React from 'react';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonSplitPane,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonAvatar
} from '@ionic/react';
import { useLocation, Link } from 'react-router-dom';
import { gridOutline, peopleOutline, personCircleOutline, cashOutline, videocamOutline, readerOutline, albumsOutline, logOutOutline, rocketOutline, barChartOutline, chatbubblesOutline } from 'ionicons/icons';
import useStore from '../state/useStore';

const navItems = [
  { to: '/dashboard', icon: gridOutline, label: 'Dashboard' },
  { to: '/users', icon: peopleOutline, label: 'Users' },
  { to: '/profiles', icon: personCircleOutline, label: 'Profiles' },
  { to: '/subscriptions', icon: readerOutline, label: 'Plans' },
  { to: '/payments', icon: cashOutline, label: 'Subscriptions' },
  { to: '/live-classes', icon: videocamOutline, label: 'Live Classes' },
  { to: '/trainers', icon: rocketOutline, label: 'Trainers' },
  { to: '/daily-tasks', icon: barChartOutline, label: 'Daily Tasks' },
  { to: '/community', icon: chatbubblesOutline, label: 'Community' },
  { to: '/videos', icon: albumsOutline, label: 'Video Library' },
  { to: '/integrations', icon: readerOutline, label: 'Integrations' }
];

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useStore();

  return (
    <IonSplitPane contentId="main" when="lg">
      <IonMenu contentId="main" type="overlay">
        <IonHeader translucent>
          <IonToolbar color="dark">
            <IonTitle>GarbhSarthi Admin</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList className="menu-list">
            {navItems.map(item => (
              <IonMenuToggle key={item.to} autoHide={false}>
                <IonItem
                  routerLink={item.to}
                  routerDirection="none"
                  detail={false}
                  color={location.pathname === item.to ? 'primary' : undefined}
                  lines="none"
                >
                  <IonIcon icon={item.icon} slot="start" />
                  <IonLabel>{item.label}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            ))}
            <IonMenuToggle autoHide={false}>
              <IonItem button lines="none" onClick={logout}>
                <IonIcon icon={logOutOutline} slot="start" />
                <IonLabel>Logout</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonPage id="main">
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>GarbhSarthi Admin</IonTitle>
            <IonButtons slot="end">
              <IonAvatar className="header-avatar">
                <div className="avatar-fallback">{user?.name?.[0] ?? 'A'}</div>
              </IonAvatar>
              <div className="header-user">
                <div className="header-name">{user?.name}</div>
                <div className="header-role">Admin</div>
              </div>
              <IonButton fill="clear" onClick={logout} color="medium">
                Logout
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div className="page-shell">{children}</div>
        </IonContent>
      </IonPage>
    </IonSplitPane>
  );
};

export default Layout;
