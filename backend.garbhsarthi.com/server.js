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
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import {
    actionToPostNewCommentInCommunityPostApiCall,
    actionToUpdateLikeDislikeData
} from "./models/commonModel.js";

const APP_PORT = process.env.APP_PORT ? Number(process.env.APP_PORT) : 4000;
const ANNOUNCED_HOST = "garbhsarthi.com";
const UPLOAD_PATH = "/var/www/html/garbhsarthi/public/uploads/recording-upload-data";
const TEACHER_SECRET = "monika1212";
// Use a fixed room id (same every time)
const ROOM_ID = process.env.ROOM_ID || "main-classroom";
export let userSocketIdsObject = {};

fs.mkdirSync(UPLOAD_PATH, { recursive: true });

const app = express();

// Define allowed origins from environment variables or default to localhost
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost',
    'capacitor://localhost',
    'https://localhost',
    'https://garbhsarthi.com',
    'https://backend.garbhsarthi.com',
    'https://trainer.garbhsarthi.com',
    'https://admin.garbhsarthi.com',
    'https://meet.garbhsarthi.com',
    'https://app.garbhsarthi.com',
];

// MySQL Session Store Configuration
const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore(
    {
        clearExpired: true,
        checkExpirationInterval: 15 * 60 * 1000, // 15m
        expiration: 30 * 24 * 60 * 60 * 1000,    // 30 days (match cookie maxAge above)
    },
    pool
);

app.set('trust proxy', 1);

// factory to create session middleware with custom name/domain
function buildSessionMiddleware(cookieName, cookieDomain) {
    return session({
        store: sessionStore,
        secret: 'garbh-sarthi-session-store',
        resave: false,
        saveUninitialized: false,
        name: cookieName,
        rolling: false, // keep writes minimal
        cookie: {
            httpOnly: true,
            sameSite: 'none',                          // cross-site since FE and BE are on different origins
            secure: true,
            domain: cookieDomain,
            maxAge: 30 * 24 * 60 * 60 * 1000,         // 30 days example (see #2 to match store)
        },
    })
}

// wrapper that picks based on req.hostname
function dynamicSession(req, res, next) {
    let cookieName = "gsess";
    let cookieDomain = ".garbhsarthi.com";

    if (req?.headers?.origin?.includes("trainer.garbhsarthi.com")) {
        cookieName = "gsess-trainer";
    } else if (req?.headers?.origin?.includes("admin.garbhsarthi.com")) {
        cookieName = "gsess-admin";
    } else if (req?.headers?.origin?.includes("app.garbhsarthi.com")) {
        cookieName = "gsess-app";
    }
    // build the right middleware and call it
    return buildSessionMiddleware(cookieName, cookieDomain)(req, res, next);
}

app.use(dynamicSession);

// CORS Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Check if the origin is in the allowedOrigins array
            if (allowedOrigins.includes(origin)) {
                return callback(null, true); // Origin is allowed and can send credentials
            } else {
                return callback(new Error('Not allowed by CORS')); // Block other origins
            }
        },
        credentials: true, // Allow cookies to be sent for allowed origins only
        methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE', // Allowed methods
        allowedHeaders: 'X-Requested-With, content-type, Accept', // Allowed headers
    })
);

app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ extended: true, limit: "300mb" }));

app.use((req, res, next) => {
    const raw = req.headers.cookie || '';
    const count = (raw.match(/(?:^|;\s*)gsess=/g) || []).length;
    const countApp = (raw.match(/(?:^|;\s*)gsess-app=/g) || []).length;
    const countAdmin = (raw.match(/(?:^|;\s*)gsess-admin=/g) || []).length;
    const countTrainer = (raw.match(/(?:^|;\s*)gsess-trainer=/g) || []).length;

    if (count > 1) {
        // Clear host-only cookie
        res.clearCookie('gsess', { path: '/' });
        // Clear domain cookie
        res.clearCookie('gsess', { domain: '.garbhsarthi.com', path: '/' });
    }else if (countApp > 1) {
        // Clear host-only cookie
        res.clearCookie('gsess-app', { path: '/' });
        // Clear domain cookie
        res.clearCookie('gsess-app', { domain: '.garbhsarthi.com', path: '/' });
    }else if (countTrainer > 1) {
        // Clear host-only cookie
        res.clearCookie('gsess-trainer', { path: '/' });
        // Clear domain cookie
        res.clearCookie('gsess-trainer', { domain: '.garbhsarthi.com', path: '/' });
    }else if (countAdmin > 1) {
        // Clear host-only cookie
        res.clearCookie('gsess-trainer', { path: '/' });
        // Clear domain cookie
        res.clearCookie('gsess-admin', { domain: '.garbhsarthi.com', path: '/' });
    }

    next();
});

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: '/api-socket',
});

io.on('connection', (socket) => {
    userSocketIdsObject[socket.id] = socket;
    socket.on('message', (data) => {
        switch (data?.type){
            case 'LIKE_DISLIKE_COMMUNITY_POST': {
                actionToUpdateLikeDislikeData(data?.data).then((postLikeCounts)=>{
                    data.data.total_counts = postLikeCounts;
                    io.emit('message', data);
                })
                break;
            }
            case 'INSERT_COMMENT_IN_COMMUNITY_POST': {
                actionToPostNewCommentInCommunityPostApiCall(data?.data).then((commentId)=>{
                    data.data.id = commentId;
                    io.emit('message', data);
                })
                break;
            }
            default: {
                io.emit('message', data);
                break;
            }
        }
    });

    socket.on('disconnect', () => {
        if(userSocketIdsObject[socket.id]){
            delete userSocketIdsObject[socket.id];
        }
    });
});

// ---------- mediasoup setup ----------
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
    // For this single-room demo we create a router on the first worker
    router = await mediasoupWorkers[0].createRouter({ mediaCodecs });
    server.listen(APP_PORT, () => console.log(`Server listening on ${APP_PORT}`));
})();

const peers = new Map(); // socketId => peerData

// helper to find teacher socket(s) in room
function findTeachers(roomId = ROOM_ID) {
    const list = [];
    for (const [sid, p] of peers.entries()) {
        if (p.roomId === roomId && p.role === "teacher") list.push(sid);
    }
    return list;
}

// ---------- Socket.io logic ----------
io.on("connection", (socket) => {
    // initialize peer
    peers.set(socket.id, {
        socketId: socket.id,
        userId: socket.id,
        name: `User-${socket.id.slice(0, 6)}`,
        role: "student",
        joined: false,
        transports: [],
        producers: [],
        consumers: [],
        roomId: ROOM_ID,
        mutedAudio: false, // Track audio mute status
        mutedVideo: false, // Track video mute status
        recvTransport: null // <<< new property to hold single recv transport
    });

    // Client requests to join room; we forward to teacher(s) as a join request
    socket.on("request-join", ({ name, userId }) => {
        const p = peers.get(socket.id);
        if (!p) return;
        if (name) p.name = name;
        if (userId) p.userId = userId;

        // notify teacher(s)
        const teachers = findTeachers(p.roomId);
        if (!teachers.length) {
            // If no teacher present, deny automatically
            socket.emit("join-denied", { reason: "Teacher not present" });
            return;
        }
        for (const teacherSid of teachers) {
            io.to(teacherSid).emit("join-request", { socketId: socket.id, userId: p.userId, name: p.name });
        }
    });

    // Teacher responds to join request: { socketId, allow }
    socket.on("join-response", ({ socketId, allow }) => {
        const requestor = peers.get(socketId);
        if (!requestor) return;
        if (allow) {
            requestor.joined = true;
            io.to(socketId).emit("join-approved", {
                roomId: requestor.roomId,
                role: requestor.role,
                userId: requestor.userId,
                name: requestor.name
            });

            io.to(requestor.roomId).emit("user-joined", {
                socketId,
                userId: requestor.userId,
                name: requestor.name,
                role: requestor.role,
            });

            // send list of current participants to the newly joined student
            const others = [];
            for (const [sid, peer] of peers.entries()) {
                if (peer.roomId === requestor.roomId && peer.joined && sid !== socketId) {
                    others.push({ socketId: sid, userId: peer.userId, name: peer.name, role: peer.role });
                }
            }
            io.to(socketId).emit("participant-list", others);

            io.sockets.sockets.get(socketId)?.join(requestor.roomId);
        } else {
            io.to(socketId).emit("join-denied", { reason: "Host denied" });
        }
    });

    // direct join (teacher or trusted clients may call)
    socket.on("join", ({ roomId = ROOM_ID, role = "student", userId, name }, cb) => {
        const p = peers.get(socket.id);
        if (!p) return cb?.({ error: "no peer" });

        p.roomId = roomId;
        p.role = role;
        if (userId) p.userId = userId;
        if (name) p.name = name;
        p.joined = true;

        io.sockets.sockets.get(socket.id)?.join(roomId);

        cb?.({ ok: true, roomId });

        // 👉 broadcast new participant
        io.to(roomId).emit("user-joined", {
            socketId: socket.id,
            userId: p.userId,
            name: p.name,
            role: p.role,
        });

        // 👉 send back list of current participants
        const others = [];
        for (const [sid, peer] of peers.entries()) {
            if (peer.roomId === roomId && peer.joined && sid !== socket.id) {
                others.push({ socketId: sid, userId: peer.userId, name: peer.name, role: peer.role });
            }
        }
        socket.emit("participant-list", others);

        console.log(`${p.name} joined as ${p.role}`);
    });


    // Provide rtpCapabilities to client
    socket.on("getRtpCapabilities", (cb) => {
        if (!router) return cb?.({ error: "Router not ready" });
        cb?.(router.rtpCapabilities);
    });

    // Create a WebRTC transport (send/recv)
    socket.on("createWebRtcTransport", async ({ direction }, cb) => {
        try {
            const listenIps = [
                { ip: "0.0.0.0", announcedIp: ANNOUNCED_HOST } // replace ANNOUNCED_HOST with public DNS
            ];
            const transport = await router.createWebRtcTransport({
                listenIps,
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
                initialAvailableOutgoingBitrate: 1000000,
                appData: { direction }
            });
            // store transport object reference
            peers.get(socket.id).transports.push(transport);

            transport.on("dtlsstatechange", (dtls) => {
                if (dtls === "closed") transport.close();
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

    // Connect transport
    socket.on("connectTransport", async ({ transportId, dtlsParameters }, cb) => {
        try {
            const p = peers.get(socket.id);
            const transport = p.transports.find(t => t.id === transportId);
            if (!transport) throw new Error("Transport not found");
            await transport.connect({ dtlsParameters });
            cb?.({ ok: true });
        } catch (err) {
            console.error("connectTransport error:", err);
            cb?.({ error: err.message });
        }
    });

// getProducers
    socket.on("getProducers", (cb) => {
        const producersList = [];
        for (const [sid, peer] of peers.entries()) {
            if (!peer.joined) continue;
            for (const pr of peer.producers) {
                producersList.push({
                    producerId: pr.id,
                    socketId: sid,
                    peerRole: peer.role,
                    name: peer.name,
                    userId: peer.userId
                });
            }
        }
        cb?.(producersList);
    });

    socket.on("consume", async ({ producerId, rtpCapabilities, transportId }, cb) => {
        try {
            const p = peers.get(socket.id);
            if (!p) return cb?.({ error: "Peer not found" });

            if (!router.canConsume({ producerId, rtpCapabilities })) {
                return cb?.({ error: "Cannot consume" });
            }

            // 🔧 find the recvTransport created by client
            const transport = p.transports.find(t => t.id === transportId);
            if (!transport) return cb?.({ error: "Transport not found" });

            // find the producer by id
            let targetProducer = null;
            for (const peer of peers.values()) {
                const prod = peer.producers.find(x => x.id === producerId);
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
                const idx = p.consumers.findIndex(c => c.id === consumer.id);
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

    // Produce (publish) section: after producing, also notify all peers to consume
    socket.on("produce", async ({ transportId, kind, rtpParameters }, cb) => {
        try {
            const p = peers.get(socket.id);
            const transport = p.transports.find(t => t.id === transportId);
            if (!transport) throw new Error("Transport not found for produce");

            const producer = await transport.produce({
                kind,
                rtpParameters,
                appData: { producedBy: socket.id }
            });
            p.producers.push(producer);

            // Broadcast with userId, name, role
            io.to(p.roomId).emit("newProducer", {
                producerId: producer.id,
                socketId: socket.id,
                kind,
                peerRole: p.role,
                userId: p.userId,
                name: p.name
            });

            // ✅ notify all other peers to consume this new producer
            for (const [sid, peer] of peers.entries()) {
                if (sid === socket.id || !peer.joined) continue;
                io.to(sid).emit("newProducer", {
                    producerId: producer.id,
                    socketId: socket.id,
                    kind,
                    peerRole: p.role,
                    userId: p.userId,
                    name: p.name
                });
            }

            producer.on("transportclose", () => producer.close());
            producer.on("close", () => {
                const idx = p.producers.findIndex(x => x.id === producer.id);
                if (idx !== -1) p.producers.splice(idx, 1);
            });

            cb?.({ id: producer.id });
        } catch (err) {
            console.error("produce error:", err);
            cb?.({ error: err.message });
        }
    });

    // On disconnect, close the recvTransport if exists
    socket.on("disconnect", () => {
        const p = peers.get(socket.id);
        if (p) {
            console.log(`socket disconnected: ${socket.id}`);
            try {
                p.consumers.forEach(c => c.close());
                p.producers.forEach(pr => pr.close());
                p.transports.forEach(t => t.close());
                if (p.recvTransport) p.recvTransport.close();
            } catch (e) {}
            peers.delete(socket.id);
            io.to(p.roomId).emit("user-left", { socketId: socket.id });
        }
    });

    // pause/resume producer (mute/unmute behavior)
    // socket.on("pauseProducer", async ({ producerId }, cb) => {
    //     try {
    //         const p = peers.get(socket.id);
    //         const producer = p.producers.find(x => x.id === producerId);
    //         if (producer) await producer.pause();
    //         cb?.({ ok: true });
    //     } catch (err) {
    //         cb?.({ error: err.message });
    //     }
    // });

    socket.on("pauseProducer", async ({ kind }, cb) => {
        try {
            const p = peers.get(socket.id);
            const producer = p.producers.find(x => x.kind === kind);
            if (producer) {
                await producer.pause();
                if (kind === "audio") p.mutedAudio = true;
                else if (kind === "video") p.mutedVideo = true;
                io.to(p.roomId).emit("participant-muted", { socketId: socket.id, type: kind });
                socket.emit("producer-paused", { kind });
                cb?.({ ok: true });
            } else {
                cb?.({ error: "Producer not found" });
            }
        } catch (err) {
            console.error("pauseProducer error:", err);
            cb?.({ error: err.message });
        }
    });

    socket.on("resumeProducer", async ({ kind }, cb) => {
        try {
            const p = peers.get(socket.id);
            const producer = p.producers.find(x => x.kind === kind);
            if (producer) {
                await producer.resume();
                if (kind === "audio") p.mutedAudio = false;
                else if (kind === "video") p.mutedVideo = false;
                io.to(p.roomId).emit("participant-unmuted", { socketId: socket.id, type: kind });
                socket.emit("producer-resumed", { kind });
                cb?.({ ok: true });
            } else {
                cb?.({ error: "Producer not found" });
            }
        } catch (err) {
            console.error("resumeProducer error:", err);
            cb?.({ error: err.message });
        }
    });

    // socket.on("resumeProducer", async ({ producerId }, cb) => {
    //     try {
    //         const p = peers.get(socket.id);
    //         const producer = p.producers.find(x => x.id === producerId);
    //         if (producer) await producer.resume();
    //         cb?.({ ok: true });
    //     } catch (err) {
    //         cb?.({ error: err.message });
    //     }
    // });

    socket.on("teacher-muted", async ({ socketId, type }) => {
        const hostPeer = peers.get(socket.id);
        if (!hostPeer || hostPeer.role !== "teacher") return;

        const targetPeer = peers.get(socketId);
        if (!targetPeer) return;

        // Find and pause the appropriate producer
        const producer = targetPeer.producers.find(p => p.kind === type);
        if (producer) {
            await producer.pause();
            if (type === "audio") targetPeer.mutedAudio = true;
            else if (type === "video") targetPeer.mutedVideo = true;

            // Notify the target participant
            io.to(socketId).emit("muted-by-teacher", { type });
            // Notify all peers in the room
            io.to(targetPeer.roomId).emit("participant-muted", { socketId, type });
        }
    });

    // host kicks a user
    socket.on("kick-user", ({ targetSocketId }) => {
        const hostPeer = peers.get(socket.id);
        if (!hostPeer || hostPeer.role !== "teacher") return;
        const target = io.sockets.sockets.get(targetSocketId);
        if (target) {
            io.to(targetSocketId).emit("kicked", { reason: "Removed by host" });
            // disconnect after notifying
            setTimeout(() => {
                try { target.disconnect(true); } catch (e) {}
            }, 200);
        }
    });

    // host ends meeting
    socket.on("end-meeting", ({ roomId = ROOM_ID }) => {
        const hostPeer = peers.get(socket.id);
        if (!hostPeer || hostPeer.role !== "teacher") return;
        // notify all sockets in the room
        io.to(roomId).emit("meeting-ended", { reason: "Host ended meeting" });
        // optionally disconnect all sockets in that room
        const sids = Array.from(peers.keys()).filter(sid => peers.get(sid).roomId === roomId);
        for (const sid of sids) {
            const s = io.sockets.sockets.get(sid);
            if (s) {
                try { s.disconnect(true); } catch (e) {}
            }
            peers.delete(sid);
        }
    });

    // leave-room
    socket.on("leave-room", ({ roomId = ROOM_ID }) => {
        socket.leave(roomId);
        const p = peers.get(socket.id);
        if (p) p.joined = false;
        io.to(roomId).emit("user-left", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
        const p = peers.get(socket.id);
        if (p) {
            console.log(`socket disconnected: ${socket.id}`);
            // cleanup producers/consumers/transports
            try {
                p.consumers.forEach(c => c.close());
                p.producers.forEach(pr => pr.close());
                p.transports.forEach(t => t.close());
            } catch (e) { /* ignore */ }
            peers.delete(socket.id);
            io.to(p.roomId).emit("user-left", { socketId: socket.id });
        }
    });
});

// ---------- HTTP endpoints for room creation and recording ----------
// Example: assuming you are storing rooms like Map<roomId, Map<socketId, peer>>
app.post("/check-room-status", (req, res) => {
    const { roomId } = req.body;

    if (!roomId) {
        return res.status(200).json({ success: 0 });
    }

    // find any teacher peer who has joined
    const teachers = findTeachers(roomId);
    if(teachers?.length){
        return res.status(200).json({ success: 1 });
    }else{
        return res.status(200).json({ success: 0 });
    }

});

app.post("/create-room", (req, res) => {
    const { secret } = req.body;
    if (secret !== TEACHER_SECRET) return res.status(403).json({ error: "Not allowed" });
    const tempFilePath = path.join(UPLOAD_PATH, `TempRecording_${ROOM_ID}.webm.part`);

    if (fs.existsSync(tempFilePath)) {
        fs.promises.unlink(tempFilePath)
            .then(() => {
                console.log(`🗑️ Deleted temp video: ${tempFilePath}`);
            })
            .catch((unlinkError) => {
                console.error("❌ Error deleting temp video:", unlinkError);
            });
    }


    // return fixed room id
    res.json({
        roomId: ROOM_ID,
        startUrl: `https://meet.garbhsarthi.com/class/start/${ROOM_ID}`,
        joinUrl: `https://meet.garbhsarthi.com/class/join/${ROOM_ID}`
    });
});

// receive base64 chunk (teacher sends)
app.post("/recording-video-chunks", (req, res) => {
    try {
        const { groupId, data } = req.body;

        if (!groupId || !data) {
            return res.status(400).json({ message: "Invalid request. Missing groupId or data." });
        }

        // Convert base64 to buffer
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
app.post(`/recording-video-finish`, async (req, res) => {
    try {
        const { groupId, duration } = req.body;

        const tempFilePath = path.join(UPLOAD_PATH, `TempRecording_${groupId}.webm.part`);
        const originalFilePath = path.join(UPLOAD_PATH, `RecordingVideo_${new Date().getDate()}-${new Date().getTime()}-${groupId}.webm`);

        if (!groupId || !duration || !fs.existsSync(tempFilePath)) {
            return res.status(200).json({ message: "No recorded chunks found or invalid request." });
        }

        // Fix WebM duration using FFmpeg
        ffmpeg(tempFilePath)
            .outputOptions([
                "-c:v copy",        // Copy video codec (no re-encoding)
                "-c:a copy",        // Copy audio codec
                `-t ${duration}`,   // Set correct duration
                "-movflags +faststart" // Optimize for streaming
            ])
            .output(originalFilePath)
            .on("end", async () => {
                console.log(`✅ Fixed video saved: ${originalFilePath}`);

                // Delete temp file to save space
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
            .run(); // Execute FFmpeg

    } catch (error) {
        console.error("❌ Error processing video:", error);
        res.status(200).json({ message: "Internal Server Error" });
    }
});

app.post("/turn-credentials", (req, res) => {
    function generateTurnCredentials(name, secret) {
        const ttl = 3600; // 1 hour validity
        const unixTimeStamp = Math.floor(Date.now() / 1000) + ttl;
        const username = `${unixTimeStamp}:${name}`;
        const hmac = crypto.createHmac("sha1", secret);
        hmac.update(username);
        const password = hmac.digest("base64");
        return {
            username,
            credential: password,
            ttl
        };
    }

    const turnSecret = "12WERTGTFREDFREDFTGHYUHTGFDE45"; // same as your coturn static-auth-secret
    const creds = generateTurnCredentials("webrtcuser", turnSecret);

    console.log('creds',creds)

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

app.use("/common", commonRouter);
