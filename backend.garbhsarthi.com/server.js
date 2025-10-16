import os from "os";
import path from "path";
import fs from "fs";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mediasoup from "mediasoup";
import ffmpeg from "fluent-ffmpeg";
import crypto from "crypto";
import commonRouter from "./routers/commonRouter.js";
import pool from "./models/connection.js";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import {
    actionToGetLiveClassDataByMeetingHashApiCall,
    actionToGetTrainerDataByTrainerIdApiCall,
    actionToPostNewCommentInCommunityPostApiCall,
    actionToUpdateLikeDislikeData
} from "./models/commonModel.js";

const APP_PORT = process.env.APP_PORT ? Number(process.env.APP_PORT) : 4000;
const ANNOUNCED_HOST = "garbhsarthi.com";
const UPLOAD_PATH = "/var/www/html/garbhsarthi/DATA_STORE_DIRECTORY/recording_upload_data";
export let userSocketIdsObject = {};

fs.mkdirSync(UPLOAD_PATH, { recursive: true });

const app = express();

/* -------------------- Room helpers / state -------------------- */
const peers = new Map(); // socketId => peerData

function generateRoomId(len = 10) {
    // URL-safe short id
    return crypto.randomBytes(len).toString("base64url");
}

function findTeachers(roomId) {
    const list = [];
    for (const [sid, p] of peers.entries()) {
        if (p.roomId === roomId && p.role === "teacher" && p.joined) list.push(sid);
    }
    return list;
}

/* -------------------- CORS / Sessions -------------------- */
// Define allowed origins
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost",
    "capacitor://localhost",
    "https://localhost",
    "https://garbhsarthi.com",
    "https://backend.garbhsarthi.com",
    "https://trainer.garbhsarthi.com",
    "https://admin.garbhsarthi.com",
    "https://meet.garbhsarthi.com",
    "https://app.garbhsarthi.com"
];

// MySQL Session Store Configuration
const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore(
    {
        clearExpired: true,
        checkExpirationInterval: 15 * 60 * 1000, // 15 min
        expiration: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    pool
);

app.set("trust proxy", 1);

function buildSessionMiddleware(cookieName, cookieDomain) {
    return session({
        store: sessionStore,
        secret: "garbh-sarthi-session-store",
        resave: false,
        saveUninitialized: false,
        name: cookieName,
        rolling: false,
        cookie: {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            domain: cookieDomain,
            maxAge: 30 * 24 * 60 * 60 * 1000
        }
    });
}

// wrapper that picks based on Origin
function dynamicSession(req, res, next) {
    let cookieName = "gsess";
    const cookieDomain = ".garbhsarthi.com";

    if (req?.headers?.origin?.includes("trainer.garbhsarthi.com")) {
        cookieName = "gsess-trainer";
    } else if (req?.headers?.origin?.includes("admin.garbhsarthi.com")) {
        cookieName = "gsess-admin";
    } else if (req?.headers?.origin?.includes("app.garbhsarthi.com")) {
        cookieName = "gsess-app";
    }
    return buildSessionMiddleware(cookieName, cookieDomain)(req, res, next);
}

app.use(dynamicSession);

// CORS
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // mobile apps / curl
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        allowedHeaders: "X-Requested-With, content-type, Accept"
    })
);

app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ extended: true, limit: "300mb" }));

// De-duplicate cookies if host & domain cookies both present
app.use((req, res, next) => {
    const raw = req.headers.cookie || "";
    const count = (raw.match(/(?:^|;\s*)gsess=/g) || []).length;
    const countApp = (raw.match(/(?:^|;\s*)gsess-app=/g) || []).length;
    const countAdmin = (raw.match(/(?:^|;\s*)gsess-admin=/g) || []).length;
    const countTrainer = (raw.match(/(?:^|;\s*)gsess-trainer=/g) || []).length;

    if (count > 1) {
        res.clearCookie("gsess", { path: "/" });
        res.clearCookie("gsess", { domain: ".garbhsarthi.com", path: "/" });
    } else if (countApp > 1) {
        res.clearCookie("gsess-app", { path: "/" });
        res.clearCookie("gsess-app", { domain: ".garbhsarthi.com", path: "/" });
    } else if (countTrainer > 1) {
        res.clearCookie("gsess-trainer", { path: "/" });
        res.clearCookie("gsess-trainer", { domain: ".garbhsarthi.com", path: "/" });
    } else if (countAdmin > 1) {
        res.clearCookie("gsess-trainer", { path: "/" });
        res.clearCookie("gsess-admin", { domain: ".garbhsarthi.com", path: "/" });
    }
    next();
});

/* -------------------- Server & Socket.IO -------------------- */
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    path: "/api-socket"
});

/* -------------------- mediasoup setup -------------------- */
const mediaCodecs = [
    { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
    { kind: "video", mimeType: "video/VP8", clockRate: 90000 }
];

const WORKERS = Math.max(1, os.cpus().length);
const mediasoupWorkers = [];
let router = null;

(async () => {
    for (let i = 0; i < WORKERS; ++i) {
        const worker = await mediasoup.createWorker({
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
            logLevel: "warn",
            logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"]
        });
        worker.on("died", () => {
            console.error("mediasoup worker died, exiting...");
            setTimeout(() => process.exit(1), 2000);
        });
        mediasoupWorkers.push(worker);
    }
    router = await mediasoupWorkers[0].createRouter({ mediaCodecs });
    server.listen(APP_PORT, () =>{
        console.log(`Server listening on ${APP_PORT}`);
    })
})();

/* -------------------- Socket.IO logic (single block) -------------------- */
io.on("connection", (socket) => {
    // map socket for community messages
    userSocketIdsObject[socket.id] = socket;

    // ---- community 'message' bus ----
    socket.on("message", async (data) => {
        try {
            switch (data?.type) {
                case "LIKE_DISLIKE_COMMUNITY_POST": {
                    const postLikeCounts = await actionToUpdateLikeDislikeData(data?.data);
                    data.data.total_counts = postLikeCounts;
                    io.emit("message", data);
                    break;
                }
                case "INSERT_COMMENT_IN_COMMUNITY_POST": {
                    const commentId = await actionToPostNewCommentInCommunityPostApiCall(data?.data);
                    data.data.id = commentId;
                    io.emit("message", data);
                    break;
                }
                default: {
                    io.emit("message", data);
                    break;
                }
            }
        } catch (err) {
            console.error("community message error:", err);
        }
    });

    // ---- mediasoup peer state ----
    peers.set(socket.id, {
        socketId: socket.id,
        userId: socket.id,
        name: `User-${socket.id.slice(0, 6)}`,
        role: "student",
        joined: false,
        transports: [],
        producers: [],
        consumers: [],
        roomId: null,
        mutedAudio: false,
        mutedVideo: false
    });

    // approval flow
    socket.on("request-join", ({ name, userId, roomId }) => {
        const p = peers.get(socket.id);
        if (!p) return;

        if (name) p.name = String(name);
        if (userId) p.userId = String(userId);
        if (roomId) p.roomId = String(roomId).trim();

        if (!p.roomId) {
            socket.emit("join-denied", { reason: "No room specified" });
            return;
        }

        const teachers = findTeachers(p.roomId);
        if (!teachers.length) {
            socket.emit("join-denied", { reason: "Teacher not present" });
            return;
        }
        for (const teacherSid of teachers) {
            io.to(teacherSid).emit("join-request", {
                socketId: socket.id,
                userId: p.userId,
                name: p.name,
                roomId: p.roomId
            });
        }
    });

    // teacher responds to request
    socket.on("join-response", ({ socketId, allow }) => {
        const requestor = peers.get(socketId);
        if (!requestor) return;

        if (allow) {
            requestor.joined = true;
            const s = io.sockets.sockets.get(socketId);
            if (s && requestor.roomId) s.join(requestor.roomId);

            io.to(socketId).emit("join-approved", {
                roomId: requestor.roomId,
                role: requestor.role,
                userId: requestor.userId,
                name: requestor.name
            });

            if (requestor.roomId) {
                io.to(requestor.roomId).emit("user-joined", {
                    socketId,
                    userId: requestor.userId,
                    name: requestor.name,
                    role: requestor.role
                });
            }

            const others = [];
            for (const [sid, peer] of peers.entries()) {
                if (peer.roomId === requestor.roomId && peer.joined && sid !== socketId) {
                    others.push({ socketId: sid, userId: peer.userId, name: peer.name, role: peer.role });
                }
            }
            io.to(socketId).emit("participant-list", others);
        } else {
            io.to(socketId).emit("join-denied", { reason: "Host denied" });
        }
    });

    // direct join (dynamic room id if none provided)
    socket.on("join", ({ roomId, role = "student", userId, name }, cb) => {
        const p = peers.get(socket.id);
        if (!p) return cb?.({ error: "no peer" });

        const finalRoomId = String(roomId || generateRoomId(9)).trim();

        p.roomId = finalRoomId;
        p.role = role;
        if (userId) p.userId = String(userId);
        if (name) p.name = String(name);
        p.joined = true;

        socket.join(finalRoomId);
        cb?.({ ok: true, roomId: finalRoomId });

        io.to(finalRoomId).emit("user-joined", {
            socketId: socket.id,
            userId: p.userId,
            name: p.name,
            role: p.role
        });

        const others = [];
        for (const [sid, peer] of peers.entries()) {
            if (peer.roomId === finalRoomId && peer.joined && sid !== socket.id) {
                others.push({ socketId: sid, userId: peer.userId, name: peer.name, role: peer.role });
            }
        }
        socket.emit("participant-list", others);

        console.log(`${p.name} joined ${finalRoomId} as ${p.role}`);
    });

    // rtp caps
    socket.on("getRtpCapabilities", (cb) => {
        if (!router) return cb?.({ error: "Router not ready" });
        cb?.(router.rtpCapabilities);
    });

    // create transport
    socket.on("createWebRtcTransport", async ({ direction }, cb) => {
        try {
            if (!router) throw new Error("Router not ready");
            const listenIps = [{ ip: "0.0.0.0", announcedIp: ANNOUNCED_HOST }];
            const transport = await router.createWebRtcTransport({
                listenIps,
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
                initialAvailableOutgoingBitrate: 1_000_000,
                appData: { direction }
            });

            const p = peers.get(socket.id);
            if (!p) throw new Error("Peer not found");
            p.transports.push(transport);

            transport.on("dtlsstatechange", (dtls) => {
                if (dtls === "closed") transport.close();
            });
            transport.on("close", () => {
                const idx = p.transports.findIndex((t) => t.id === transport.id);
                if (idx !== -1) p.transports.splice(idx, 1);
            });

            cb?.({
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            });
        } catch (err) {
            console.error("createWebRtcTransport error:", err);
            cb?.({ error: err.message });
        }
    });

    // connect transport
    socket.on("connectTransport", async ({ transportId, dtlsParameters }, cb) => {
        try {
            const p = peers.get(socket.id);
            if (!p) throw new Error("Peer not found");
            const transport = p.transports.find((t) => t.id === transportId);
            if (!transport) throw new Error("Transport not found");
            await transport.connect({ dtlsParameters });
            cb?.({ ok: true });
        } catch (err) {
            console.error("connectTransport error:", err);
            cb?.({ error: err.message });
        }
    });

    // list producers in same room
    socket.on("getProducers", (cb) => {
        const p = peers.get(socket.id);
        if (!p) return cb?.({ error: "Peer not found" });
        const list = [];
        for (const [sid, peer] of peers.entries()) {
            if (!peer.joined || peer.roomId !== p.roomId) continue;
            for (const pr of peer.producers) {
                list.push({
                    producerId: pr.id,
                    socketId: sid,
                    peerRole: peer.role,
                    name: peer.name,
                    userId: peer.userId
                });
            }
        }
        cb?.(list);
    });

    // consume
    socket.on("consume", async ({ producerId, rtpCapabilities, transportId }, cb) => {
        try {
            const p = peers.get(socket.id);
            if (!p) return cb?.({ error: "Peer not found" });

            if (!router.canConsume({ producerId, rtpCapabilities })) {
                return cb?.({ error: "Cannot consume" });
            }

            const transport = p.transports.find((t) => t.id === transportId);
            if (!transport) return cb?.({ error: "Transport not found" });

            // ensure producer belongs to same room
            let targetProducer = null;
            for (const peer of peers.values()) {
                if (peer.roomId !== p.roomId) continue;
                const prod = peer.producers.find((x) => x.id === producerId);
                if (prod) {
                    targetProducer = prod;
                    break;
                }
            }
            if (!targetProducer) return cb?.({ error: "Producer not found" });

            const consumer = await transport.consume({
                producerId,
                rtpCapabilities,
                paused: false
            });

            p.consumers.push(consumer);

            consumer.on("transportclose", () => consumer.close());
            consumer.on("producerclose", () => {
                const idx = p.consumers.findIndex((c) => c.id === consumer.id);
                if (idx !== -1) p.consumers.splice(idx, 1);
                socket.emit("producer-closed", { producerId });
            });

            cb?.({
                id: consumer.id,
                producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters
            });
        } catch (err) {
            console.error("consume error:", err);
            cb?.({ error: err.message });
        }
    });

    // produce
    socket.on("produce", async ({ transportId, kind, rtpParameters }, cb) => {
        try {
            const p = peers.get(socket.id);
            if (!p) throw new Error("Peer not found");
            const transport = p.transports.find((t) => t.id === transportId);
            if (!transport) throw new Error("Transport not found for produce");

            const producer = await transport.produce({
                kind,
                rtpParameters,
                appData: { producedBy: socket.id }
            });
            p.producers.push(producer);

            producer.on("transportclose", () => producer.close());
            producer.on("close", () => {
                const idx = p.producers.findIndex((x) => x.id === producer.id);
                if (idx !== -1) p.producers.splice(idx, 1);
            });

            if (p.roomId) {
                io.to(p.roomId).emit("newProducer", {
                    producerId: producer.id,
                    socketId: socket.id,
                    kind,
                    peerRole: p.role,
                    userId: p.userId,
                    name: p.name
                });
            }

            cb?.({ id: producer.id });
        } catch (err) {
            console.error("produce error:", err);
            cb?.({ error: err.message });
        }
    });

    // self mute/unmute
    socket.on("pauseProducer", async ({ kind }, cb) => {
        try {
            const p = peers.get(socket.id);
            if (!p) throw new Error("Peer not found");
            const producer = p.producers.find((x) => x.kind === kind);
            if (!producer) return cb?.({ error: "Producer not found" });

            await producer.pause();
            if (kind === "audio") p.mutedAudio = true;
            else if (kind === "video") p.mutedVideo = true;
            if (p.roomId) io.to(p.roomId).emit("participant-muted", { socketId: socket.id, type: kind });
            socket.emit("producer-paused", { kind });
            cb?.({ ok: true });
        } catch (err) {
            console.error("pauseProducer error:", err);
            cb?.({ error: err.message });
        }
    });

    socket.on("resumeProducer", async ({ kind }, cb) => {
        try {
            const p = peers.get(socket.id);
            if (!p) throw new Error("Peer not found");
            const producer = p.producers.find((x) => x.kind === kind);
            if (!producer) return cb?.({ error: "Producer not found" });

            await producer.resume();
            if (kind === "audio") p.mutedAudio = false;
            else if (kind === "video") p.mutedVideo = false;
            if (p.roomId) io.to(p.roomId).emit("participant-unmuted", { socketId: socket.id, type: kind });
            socket.emit("producer-resumed", { kind });
            cb?.({ ok: true });
        } catch (err) {
            console.error("resumeProducer error:", err);
            cb?.({ error: err.message });
        }
    });

    // teacher controls
    socket.on("teacher-muted", async ({ socketId, type }) => {
        const hostPeer = peers.get(socket.id);
        if (!hostPeer || hostPeer.role !== "teacher") return;

        const targetPeer = peers.get(socketId);
        if (!targetPeer || targetPeer.roomId !== hostPeer.roomId) return;

        const producer = targetPeer.producers.find((p) => p.kind === type);
        if (producer) {
            await producer.pause();
            if (type === "audio") targetPeer.mutedAudio = true;
            else if (type === "video") targetPeer.mutedVideo = true;

            io.to(socketId).emit("muted-by-teacher", { type });
            io.to(targetPeer.roomId).emit("participant-muted", { socketId, type });
        }
    });

    socket.on("kick-user", ({ targetSocketId }) => {
        const hostPeer = peers.get(socket.id);
        if (!hostPeer || hostPeer.role !== "teacher") return;

        const target = io.sockets.sockets.get(targetSocketId);
        const targetPeer = peers.get(targetSocketId);
        if (!target || !targetPeer || targetPeer.roomId !== hostPeer.roomId) return;

        io.to(targetSocketId).emit("kicked", { reason: "Removed by host" });
        setTimeout(() => {
            try {
                target.disconnect(true);
            } catch (_) {}
        }, 200);
    });

    socket.on("end-meeting", ({ roomId }) => {
        const hostPeer = peers.get(socket.id);
        if (!hostPeer || hostPeer.role !== "teacher") return;
        const targetRoom = roomId || hostPeer.roomId;
        if (!targetRoom) return;

        io.to(targetRoom).emit("meeting-ended", { reason: "Host ended meeting" });

        const sids = Array.from(peers.keys()).filter((sid) => peers.get(sid).roomId === targetRoom);
        for (const sid of sids) {
            const s = io.sockets.sockets.get(sid);
            if (s) {
                try {
                    s.disconnect(true);
                } catch (_) {}
            }
            peers.delete(sid);
        }
    });

    socket.on("leave-room", ({ roomId }) => {
        const p = peers.get(socket.id);
        const r = roomId || p?.roomId;
        if (!r) return;

        socket.leave(r);
        if (p) p.joined = false;
        io.to(r).emit("user-left", { socketId: socket.id });
    });

    // single disconnect handler
    socket.on("disconnect", () => {
        userSocketIdsObject[socket.id] && delete userSocketIdsObject[socket.id];
        const p = peers.get(socket.id);
        if (p) {
            try {
                p.consumers.forEach((c) => c.close());
                p.producers.forEach((pr) => pr.close());
                p.transports.forEach((t) => t.close());
            } catch (_) {}
            peers.delete(socket.id);
            if (p.roomId) io.to(p.roomId).emit("user-left", { socketId: socket.id });
        }
        console.log(`socket disconnected: ${socket.id}`);
    });
});

/* -------------------- HTTP endpoints -------------------- */
app.post("/check-room-status", (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
        return res.status(200).json({ success: 0 });
    }
    const teachers = findTeachers(roomId);
    return res.status(200).json({ success: teachers?.length ? 1 : 0 });
});

// Create/verify room. If roomId missing, generate dynamically after user check.
app.post("/create-room", async (req, res) => {
    try {
        let { roomId, userId } = req.body ?? {};
        const safeUserId = String(userId || "").trim();
        let safeRoomId = (roomId ? String(roomId) : "").trim();

        if (!safeUserId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // 1) Verify trainer
        let userData;
        try {
            userData = await actionToGetTrainerDataByTrainerIdApiCall(safeUserId);
        } catch (e) {
            console.error("Error fetching trainer data:", e);
            return res.status(502).json({ error: "Failed to verify user" });
        }
        if (!userData?.id) {
            return res.status(403).json({ error: "Not allowed" });
        }

        // If no roomId provided, generate one after user validation
        if (!safeRoomId) {
            safeRoomId = generateRoomId(9);
        }

        // 2) Verify class/meeting by meeting hash = roomId
        let classData;
        try {
            classData = await actionToGetLiveClassDataByMeetingHashApiCall(safeRoomId);
        } catch (e) {
            console.error("Error fetching class data:", e);
            return res.status(502).json({ error: "Failed to verify class" });
        }
        if (!classData?.id) {
            // Change this to your "create class" flow if desired.
            return res.status(403).json({ error: "Not allowed" });
        }

        // 3) Clean stray temp file
        const tempFilePath = path.join(UPLOAD_PATH, `TempRecording_${safeRoomId}.webm.part`);
        try {
            if (fs.existsSync(tempFilePath)) {
                await fs.promises.unlink(tempFilePath);
                console.log(`🗑️ Deleted temp video: ${tempFilePath}`);
            }
        } catch (unlinkError) {
            console.error("❌ Error deleting temp video:", unlinkError);
        }

        // 4) Respond
        return res.json({
            roomId: safeRoomId,
            classData,
            userData,
            startUrl: `https://meet.garbhsarthi.com/class/start/${encodeURIComponent(safeUserId)}/${encodeURIComponent(
                safeRoomId
            )}`
        });
    } catch (err) {
        console.error("Unexpected error in /create-room:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// receive base64 chunk (teacher sends)
app.post("/recording-video-chunks", (req, res) => {
    try {
        const { groupId, data } = req.body;
        if (!groupId || !data) {
            return res.status(400).json({ message: "Invalid request. Missing groupId or data." });
        }
        const chunkBuffer = Buffer.from(data, "base64");
        const tempFilePath = path.join(UPLOAD_PATH, `TempRecording_${groupId}.webm.part`);
        fs.appendFileSync(tempFilePath, chunkBuffer);
        res.status(200).json({ message: `Chunk received for group ${groupId}` });
    } catch (error) {
        console.error("Error processing chunk:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Merge and save video file
app.post("/recording-video-finish", async (req, res) => {
    try {
        const { groupId, duration } = req.body;

        const tempFilePath = path.join(UPLOAD_PATH, `TempRecording_${groupId}.webm.part`);
        const originalFilePath = path.join(
            UPLOAD_PATH,
            `RecordingVideo_${new Date().getDate()}-${new Date().getTime()}-${groupId}.webm`
        );

        if (!groupId || !duration || !fs.existsSync(tempFilePath)) {
            return res.status(200).json({ message: "No recorded chunks found or invalid request." });
        }

        ffmpeg(tempFilePath)
            .outputOptions([
                "-c:v copy",
                "-c:a copy",
                `-t ${duration}`,
                "-movflags +faststart"
            ])
            .output(originalFilePath)
            .on("end", async () => {
                console.log(`✅ Fixed video saved: ${originalFilePath}`);
                try {
                    await fs.promises.unlink(tempFilePath);
                    console.log(`🗑️ Deleted temp video: ${tempFilePath}`);
                } catch (unlinkError) {
                    console.error("❌ Error deleting temp video:", unlinkError);
                }
                res.json({ save: true, name: `RecordingVideo_${groupId}.webm` });
            })
            .on("error", (err) => {
                console.error("❌ FFmpeg processing error:", err);
                res.status(200).json({ message: "FFmpeg processing failed" });
            })
            .run();
    } catch (error) {
        console.error("❌ Error processing video:", error);
        res.status(200).json({ message: "Internal Server Error" });
    }
});

// TURN credentials
app.post("/turn-credentials", (req, res) => {
    function generateTurnCredentials(name, secret) {
        const ttl = 3600;
        const unixTimeStamp = Math.floor(Date.now() / 1000) + ttl;
        const username = `${unixTimeStamp}:${name}`;
        const hmac = crypto.createHmac("sha1", secret);
        hmac.update(username);
        const password = hmac.digest("base64");
        return { username, credential: password, ttl };
    }

    const turnSecret = "12WERTGTFREDFREDFTGHYUHTGFDE45"; // coturn static-auth-secret
    const creds = generateTurnCredentials("webrtcuser", turnSecret);
    console.log("creds", creds);

    res.json({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
                urls: [
                    "turn:turn.garbhsarthi.com:3478?transport=udp",
                    "turn:turn.garbhsarthi.com:3478?transport=tcp",
                    "turns:turn.garbhsarthi.com:5349?transport=udp",
                    "turns:turn.garbhsarthi.com:5349?transport=tcp"
                ],
                username: creds.username,
                credential: creds.credential
            }
        ]
    });
});

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// common routes
app.use("/common", commonRouter);
