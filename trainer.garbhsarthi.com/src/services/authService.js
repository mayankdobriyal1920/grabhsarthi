/**
 * Placeholder auth service.
 * Replace these with real API calls later.
 */

const FAKE_TOKEN_KEY = "gs_trainer_token";
const FAKE_USER_KEY = "gs_trainer_user";

/**
 * Fake login - resolves with token and trainer info for demo credentials.
 * Replace with an actual POST /trainer/login in the future.
 */
export async function fakeLogin({ mobile, password }) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));

    // Demo credentials
    if (mobile === "9999999999" && password === "123456") {
        const token = "dummy-trainer-token-abc123";
        const trainer = { id: 1, name: "Monika", mobile };

        // persist locally
        localStorage.setItem(FAKE_TOKEN_KEY, token);
        localStorage.setItem(FAKE_USER_KEY, JSON.stringify(trainer));

        return { success: true, token, trainer };
    }

    return { success: false, message: "Invalid mobile or password" };
}

/**
 * Fake logout
 */
export function fakeLogout() {
    localStorage.removeItem(FAKE_TOKEN_KEY);
    localStorage.removeItem(FAKE_USER_KEY);
}

/**
 * Check local auth
 */
export function getStoredAuth() {
    const token = localStorage.getItem(FAKE_TOKEN_KEY);
    const trainerJson = localStorage.getItem(FAKE_USER_KEY);
    const trainer = trainerJson ? JSON.parse(trainerJson) : null;
    return { token, trainer };
}

/**
 * Fake API to fetch trainer's classes.
 * Replace with GET /trainer/classes when ready.
 */
export async function fakeGetTrainerClasses() {
    await new Promise((r) => setTimeout(r, 450));

    // sample classes (times are illustrative)
    return [
        {
            id: 1,
            title: "Prenatal Yoga",
            start_time: "2025-10-01 10:00 AM",
            meeting_link: "https://zoom.us/j/your-prenatal-class",
        },
        {
            id: 2,
            title: "Garbh Sanskaar",
            start_time: "2025-10-01 11:00 AM",
            meeting_link: "https://meet.google.com/your-garbh-class",
        },
        {
            id: 3,
            title: "Pregnancy Yoga",
            start_time: "2025-10-01 01:00 PM",
            meeting_link: "https://yourdomain.com/live/pregnancy-yoga",
        },
    ];
}
