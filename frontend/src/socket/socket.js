import { io } from "socket.io-client";
import {
    actionToInsertCommunityPostCommentDataLocally,
    actionToInsertCommunityPostDataLocally,
    actionToUpdateCommunityPostLikesDataLocally
} from "../apiHelper/CommonAction";

let socketInstance = null;
let outboundQueue = [];
const QUEUE_MAX = 200; // prevent unbounded growth
const SOCKET_URL = "https://garbhsarthi.com";

// Create (or recreate) the connection.
// Pass token if your backend expects it.
export const createSocketConnection = () => {
    const socket = io(SOCKET_URL, {
        path: "/api-socket",
        transports: ["websocket"],
        withCredentials: true,
        // Auth (uncomment if server uses it)
        // auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5000,
        timeout: 10000,       // connection timeout
        forceNew: false,      // reuse connection where possible
        autoConnect: true,    // connect immediately
    });

    // Wire lifecycle events
    socket.on("connect", () => {
        console.log("Connected to socket server:", socket.id);
        setSocket(socket);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connect_error:", err?.message || err);
    });

    socket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
    });

    // Generic message listener (if your server uses a single 'message' channel)
    socket.on("message", (websocketData) => {
        switch (websocketData?.type) {
            case 'INSERT_COMMUNITY_POST_DATA': {
                actionToInsertCommunityPostDataLocally(websocketData?.data);
                break;
            }
            case 'LIKE_DISLIKE_COMMUNITY_POST': {
                actionToUpdateCommunityPostLikesDataLocally(websocketData?.data);
                break;
            }
            case 'INSERT_COMMENT_IN_COMMUNITY_POST': {
                actionToInsertCommunityPostCommentDataLocally(websocketData?.data);
                break;
            }
        }
    });

    return socket;
};

export const getSocket = () => socketInstance;

export const setSocket = (s) => {
    socketInstance = s;

    // Flush queued messages on connect
    if (socketInstance?.connected && outboundQueue.length) {
        for (const msg of outboundQueue) {
            socketInstance.emit("message", msg.payload, msg.ack);
        }
        outboundQueue = [];
    }
};

// Send a message. If disconnected, queue it.
// Optionally pass an ack callback: (err, serverData) => {}
export const sendSocketMessage = (type, data = {}, ack) => {
    const payload = { type, data, ts: Date.now() };
    const s = getSocket();

    if (s?.connected) {
        // Use Socket.IO’s built-in acks with a timeout for safety.
        // NOTE: If your server expects strings, replace `payload` with `JSON.stringify(payload)`
        s.timeout(8000).emit("message", payload, (err, serverResp) => {
            if (ack) ack(err, serverResp);
        });
    } else {
        // Queue until connected
        if (outboundQueue.length >= QUEUE_MAX) outboundQueue.shift();
        outboundQueue.push({ payload, ack });
    }

    return payload; // useful for optimistic UI
};

// Helpers
function safeParseJSON(str) {
    try { return JSON.parse(str); } catch { return null; }
}