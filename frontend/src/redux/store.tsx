import { createStore, compose, applyMiddleware,combineReducers } from 'redux';
import {thunk} from 'redux-thunk';
import {
    signupSigninFormErrorReducer,
    userAuthDetailReducer,
    userOtpReducer,
    userSessionReducer
} from "./CommonReducers";

const initialState = {
    userSession: {loading: true, status:0},
    userAuthDetail: {userInfo: null, loading:false},
    userOtpDetails: {loading: false},
    signupSigninFormError: {}
}
export const rootReducer = combineReducers({
    userSession: userSessionReducer,
    signupSigninFormError: signupSigninFormErrorReducer,
    userAuthDetail: userAuthDetailReducer,
    userOtpDetails: userOtpReducer
});

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}
const composeEnhancer =  window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose || compose;
const store = createStore(
    rootReducer,
    initialState,
    composeEnhancer(applyMiddleware(thunk))
);
export type RootState = ReturnType<typeof rootReducer>
export default store;
