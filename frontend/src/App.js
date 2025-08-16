import React, {useEffect} from 'react';
import {setupIonicReact, IonApp, IonRouterOutlet, IonLoading} from '@ionic/react';
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/common-style.css';
import {useDispatch,useSelector} from "react-redux";
import {actionToConnectSocketServer} from "./redux/CommonAction";
import {IonReactRouter} from "@ionic/react-router";
import {Redirect, Route} from "react-router";
import WithoutLoginHomePage from "./pages/WithoutLoginHomePage";
import LoginPage from "./pages/LoginPage";
import ChooseRolePageAfterLoginComponent from "./pages/ChooseRolePageAfterLoginComponent";
import CreateRoleBasedFormPage from "./pages/CreateRoleBasedFormPage";
import AppEntryTabsPage from "./pages/AppEntryTabsPage";
setupIonicReact();

const AppEnterMainPage = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(actionToConnectSocketServer());
    }, []);

    return (
        <IonReactRouter>
            <IonRouterOutlet>
                <Redirect  exact from="/"  to="/dashboard-home" />
                <Route render={() => <Redirect to="/dashboard-home" />} />
            </IonRouterOutlet>
        </IonReactRouter>
    );
}

const PublicRoutes = () => {
    return (
        <IonReactRouter>
            <IonRouterOutlet>
                <Route path="/home" exact={true} component={WithoutLoginHomePage} />
                <Route path="/login" exact={true} component={LoginPage} />
                <Route path="/choose-role" exact={true} component={ChooseRolePageAfterLoginComponent} />
                <Route path="/create-profile" exact={true} component={CreateRoleBasedFormPage} />
                <Route path="/dashboard" component={AppEntryTabsPage} />
                <Redirect exact from="/" to="/home" />
                <Route render={() => <Redirect to="/home" />} />
            </IonRouterOutlet>
        </IonReactRouter>
    );
};

const App = () => {
    // const dispatch = useDispatch();
    // const userSession = useSelector((state) => state.userSession);
    // const {userInfo} = useSelector((state) => state.userAuthDetail);

    // useEffect(() => {
    //     dispatch(actionToGetUserSessionData());
    // }, []);

    return (
        <IonApp>
            {/*{(!userSession?.loading) ?*/}
            {/*    <React.Fragment>*/}
            {/*        {userInfo?.id ? <AppEnterMainPage/> : <PublicRoutes/>}*/}
            {/*    </React.Fragment>:''*/}
            {/*}*/}
            {/*<IonLoading className={"loading_loader_spinner_container"} isOpen={userSession?.loading} message={"Loading..."}/>*/}

            <PublicRoutes/>
        </IonApp>
    );
}
export default App;