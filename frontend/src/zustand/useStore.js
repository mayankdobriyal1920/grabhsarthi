import { create } from 'zustand';

const useStore = create((set) => ({
    // ----- USER SIGNIN STATE ----- //
    userAuthDetail: { userInfo: null, loading: false },
    signinRequest: () => set({ userAuthDetail: { userInfo: null, loading: true } }),
    signinSuccess: (userData) => set({ userAuthDetail: { userInfo: userData, loading: false } }),
    signOut: () => set({ userAuthDetail: { userInfo: null, loading: false } }),
    otpValidationError:false,
    setOtpValidationError: (error) => set({ otpValidationError: error }),

    // ----- USER SESSION STATE ----- //
    userSession: { loading: true, success: 0 },
    startUserSession: () => set({ userSession: { loading: true, success: 0 } }),
    setUserSession: (data) => set({ userSession: { loading: false, success: data } }),

    // ----- USER SESSION STATE ----- //
    currentMemberMemberShipDetail: { loading: true, memberShipDetail: {} },
    getCurrentMemberMemberShipDetailRequest: () => set({ currentMemberMemberShipDetail: { loading: true, memberShipDetail: {} } }),
    getCurrentMemberMemberShipDetailSuccess: (data) => set({ currentMemberMemberShipDetail: { loading: false, memberShipDetail: data } }),

    // ----- SIGNUP/SIGNIN FORM ERROR ----- //
    signupSigninError: null,
    setSignupSigninError: (error) => set({ signupSigninError: error }),

    // ----- OTP ----- //
    userOtpDetails: { loading: false, success: false, error: null },
    getOtpRequest: () => set({ userOtpDetails: { loading: true, success: false, error: null } }),
    getOtpSuccess: () => set({ userOtpDetails: { loading: false, success: true, error: null } }),
    getOtpFail: () => set({ userOtpDetails: { loading: false, success: false, error:'Wrong OTP!!' } }),

}));

export default useStore;
