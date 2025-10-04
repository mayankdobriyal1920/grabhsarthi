import { create } from 'zustand';

const useStore = create((set) => ({
    // ----- USER SIGNIN STATE ----- //
    userAuthDetail: { userInfo: null, loading: false },
    startUserAuthDetail: () => set({ userAuthDetail: { userInfo: null, loading: true } }),
    setUserAuthDetail: (userData) => set({ userAuthDetail: { userInfo: userData, loading: false } }),
    signOut: () => set({ userAuthDetail: { userInfo: null, loading: false } }),

    // ----- USER SESSION STATE ----- //
    userSession: { loading: true, success: 0 },
    startUserSession: () => set({ userSession: { loading: true, success: 0 } }),
    setUserSession: (data) => set({ userSession: { loading: false, success: data } }),

    allScheduledLiveClassData: { loading: false, scheduledLiveClassData: []},
    requestAllScheduledLiveClassData: () => set({ allScheduledLiveClassData: { loading: true, scheduledLiveClassData:[]} }),
    setAllScheduledLiveClassData: (data) => set({
        allScheduledLiveClassData: {
            loading: false,
            scheduledLiveClassData: data
        },
    }),
}));

export default useStore;
