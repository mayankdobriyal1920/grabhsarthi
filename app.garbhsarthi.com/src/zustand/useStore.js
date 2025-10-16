import { create } from 'zustand';

const useStore = create((set) => ({
    // ----- USER SIGNIN STATE ----- //
    userAuthDetail: { userInfo: null, loading: false },
    startUserAuthDetail: () => set({ userAuthDetail: { userInfo: null, loading: true } }),
    setUserAuthDetail: (userData) => set({ userAuthDetail: { userInfo: userData, loading: false } }),
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

    commonActionSheetPopupData: {page:'',popupData:null},
    setCommonActionSheetPopupData: (data) => set({ commonActionSheetPopupData: data }),

    communityPostIsInUploadingMode: {status:false,progress:0},
    setCommunityPostIsInUploadingMode: (data) => set({ communityPostIsInUploadingMode: data }),

    communityAllPostData: { loading: false, communityPost: [],offset:0,totalCount:0},
    requestCommunityAllPostData: () => set({ communityAllPostData: { loading: true, communityPost:[],offset:0,totalCount:0} }),
    setCommunityAllPostData: (data) => set({
                                            communityAllPostData: {
                                                loading: false,
                                                communityPost: data?.communityPost || [],
                                                offset: data?.offset || 0,
                                                totalCount: data?.totalCount || 0
                                            },
                                        }),

    communityPostCommentData: { loading: false, postCommentData: []},
    requestCommunityPostCommentData: () => set({ communityPostCommentData: { loading: true, postCommentData:[]} }),
    setCommunityPostCommentData: (data) => set({
        communityPostCommentData: {
            loading: false,
            postCommentData: data
        },
    }),

    appVideoLibraryDataByCategory: { loading: false, videoLibraryData: []},
    requestAppVideoLibraryDataByCategory: () => set({ appVideoLibraryDataByCategory: { loading: true, videoLibraryData:[]} }),
    setAppVideoLibraryDataByCategory: (data) => set({
        appVideoLibraryDataByCategory: {
            loading: false,
            videoLibraryData: data
        },
    }),

    allSubscriptionPlanData: { loading: false, subscriptionPlanData: []},
    requestAllSubscriptionPlanData: () => set({ allSubscriptionPlanData: { loading: true, subscriptionPlanData:[]} }),
    setAllSubscriptionPlanData: (data) => set({
        allSubscriptionPlanData: {
            loading: false,
            subscriptionPlanData: data
        },
    }),

    allScheduledLiveClassData: { loading: false, scheduledLiveClassData: []},
    requestAllScheduledLiveClassData: () => set({ allScheduledLiveClassData: { loading: true, scheduledLiveClassData:[]} }),
    setAllScheduledLiveClassData: (data) => set({
        allScheduledLiveClassData: {
            loading: false,
            scheduledLiveClassData: data
        },
    }),


    dailyTasksToday: {
        loading: false,
        data: [],
        overallPercent: 0,
        date: null,
        error: null,
    },

    // setters only (no computation here)
    requestDailyTasksToday: () =>
        set({
            dailyTasksToday: {
                loading: true,
                data: [],
                overallPercent: 0,
                date: null,
                error: null,
            },
        }),

    setDailyTasksToday: ({ data, overallPercent, date }) =>
        set({
            dailyTasksToday: {
                loading: false,
                data,
                overallPercent,
                date,
                error: null,
            },
        }),

    setDailyTasksTodayError: (message) =>
        set((s) => ({
            dailyTasksToday: { ...s.dailyTasksToday, loading: false, error: message || 'Failed to load daily tasks' },
        }))
}));

export default useStore;
