import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Device } from "mediasoup-client";
import {
    actionToGetIceServers,
    actionToSendVideoChunkDataToServer,
    actionToSendVideoChunkDataToServerFinishProcess,
} from "./api/CommonApiHelper";

const SOCKET_URL = "https://garbhsarthi.com";
const RECORD_INTERVAL = 1000;
const userId = Math.random().toString(36).substring(2, 10);

export default function VideoRoom({ isTeacher = false, roomId = "main-classroom", setJoined,userName = 'Monika' }) {
    const localVideoRef = useRef(null);
    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [waitingApproval, setWaitingApproval] = useState(!isTeacher);

    const socketRef = useRef(null);
    const deviceRef = useRef(null);
    const sendTransportRef = useRef(null);
    const recvTransportRef = useRef(null);
    const producersMapRef = useRef(new Map());
    const consumerMapRef = useRef(new Map());
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [isRecordingPaused, setIsRecordingPaused] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);


    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {autoConnect: false});

        async function init() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                }).catch(err => {
                    console.error("getUserMedia failed:", err.name, err.message);
                    throw new Error(`Failed to access media devices: ${err.message}`);
                });

                console.log("Local stream obtained:", stream.getTracks());
                mediaStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.play().catch(err => {
                        console.warn("Local video playback failed:", err);
                    });
                }

                socketRef.current.connect();
                registerSocketHandlers();

                if (isTeacher) {
                    socketRef.current.emit("join", {roomId, role: "teacher", name: userName, userId}, (res) => {
                        console.log("Joined as teacher:", res);
                    });
                    setWaitingApproval(false);
                    await setupMediasoup(stream, true);
                    startRecording(stream);
                } else {
                    socketRef.current.emit("request-join", {name: userName, userId});
                    setWaitingApproval(true);
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }
        }

        init();

        return () => {
            try {
                mediaStreamRef.current?.getTracks().forEach(t => t.stop());
            } catch (e) {
            }
            stopRecording();
            consumerMapRef.current.forEach(c => c.close());
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            socketRef.current?.disconnect();
        };
    }, []);

// Example usage in mediasoup-client

    function registerSocketHandlers() {
        const socket = socketRef.current;

        socket.on("join-request", (payload) => {
            if (!isTeacher) return;
            setJoinRequests((prev) => {
                if (prev.find((r) => r.socketId === payload.socketId)) return prev;
                return [...prev, payload];
            });
        });

        socket.on("join-approved", async (payload) => {
            console.log("Join approved:", payload);
            setWaitingApproval(false);
            await setupMediasoup(mediaStreamRef.current, false);

            const producers = await new Promise((resolve) => socket.emit("getProducers", resolve));
            for (const prod of producers) {
                if (!producersMapRef.current.has(prod.producerId)) {
                    producersMapRef.current.set(prod.producerId, {
                        socketId: prod.socketId,
                        kind: prod.kind || "video",
                        name: prod.name,
                        userId: prod.userId,
                        peerRole: prod.peerRole,
                    });
                    await consumeProducer(prod.producerId);
                }
            }
        });

        socket.on("join-denied", (payload) => {
            alert(payload?.reason || "Join denied");
            socket.disconnect();
        });

        socket.on("participant-list", (list) => {
            setParticipants((prev) => {
                const newOnes = list.filter(p => !prev.find(x => x.socketId === p.socketId));
                return [...prev, ...newOnes.map(p => ({...p, stream: null}))];
            });
        });

        socket.on("user-joined", async (p) => {
            console.log("User joined:", p);
            setParticipants((prev) => {
                if (prev.find((x) => x.socketId === p.socketId)) return prev;
                return [...prev, {...p, stream: null}];
            });

            if (!isTeacher && recvTransportRef.current) {
                const producers = await new Promise((resolve) => socket.emit("getProducers", resolve));
                for (const prod of producers) {
                    if (!producersMapRef.current.has(prod.producerId)) {
                        producersMapRef.current.set(prod.producerId, {
                            socketId: prod.socketId,
                            kind: prod.kind || "video",
                            name: prod.name,
                            userId: prod.userId,
                            peerRole: prod.peerRole,
                        });
                        await consumeProducer(prod.producerId);
                    }
                }
            }
        });

        socket.on("user-left", ({socketId}) => {
            console.log("User left:", socketId);
            setParticipants((prev) => prev.filter((x) => x.socketId !== socketId));
        });

        socket.on("newProducer", async (prod) => {
            if (!producersMapRef.current.has(prod.producerId)) {
                producersMapRef.current.set(prod.producerId, {
                    socketId: prod.socketId,
                    kind: prod.kind || "video",
                    name: prod.name,
                    userId: prod.userId,
                    peerRole: prod.peerRole,
                });

                // 🔧 Always consume, regardless of role
                await consumeProducer(prod.producerId);
            }
        });


        socket.on("producer-closed", ({producerId}) => {
            console.log("Producer closed:", producerId);
            const info = producersMapRef.current.get(producerId);
            if (info) {
                setParticipants((prev) => prev.filter((p) => p.socketId !== info.socketId));
            }
            producersMapRef.current.delete(producerId);
        });

        socket.on("kicked", ({reason}) => {
            setJoined(false);
            socket.disconnect();
        });

        socket.on("meeting-ended", ({reason}) => {
            socket.disconnect();
            if (!isTeacher) {
                window.location.reload();
            }
        });
    }

    async function setupMediasoup(stream, isHost) {
        console.log("Setting up MediaSoup with stream:", stream.getTracks());
        const socket = socketRef.current;
        const device = new Device();
        deviceRef.current = device;

        try {
            const routerRtpCapabilities = await new Promise((resolve, reject) => {
                socket.emit("getRtpCapabilities", (data) => {
                    if (data.error) reject(data.error);
                    else resolve(data);
                });
            });

            await device.load({routerRtpCapabilities});
            console.log("Device loaded with RTP capabilities:", device.rtpCapabilities);

            if (stream) {
                const sendParams = await new Promise((resolve, reject) => {
                    socket.emit("createWebRtcTransport", {direction: "send"}, (data) => {
                        if (data.error) reject(data.error);
                        else resolve(data);
                    });
                });

                const iceServers = await actionToGetIceServers();
                console.log(iceServers);

                sendTransportRef.current = device.createSendTransport({
                    id: sendParams.id,
                    iceParameters: sendParams.iceParameters,
                    iceCandidates: sendParams.iceCandidates,
                    dtlsParameters: sendParams.dtlsParameters,
                    // 👇 add here
                    iceServers: iceServers
                });

                sendTransportRef.current.on("connect", ({dtlsParameters}, callback, errback) => {
                    socket.emit("connectTransport", {
                        transportId: sendTransportRef.current.id,
                        dtlsParameters
                    }, (res) => {
                        if (res?.error) errback(res.error);
                        else callback();
                    });
                });

                sendTransportRef.current.on("produce", async ({kind, rtpParameters}, callback, errback) => {
                    socket.emit("produce", {transportId: sendTransportRef.current.id, kind, rtpParameters}, (res) => {
                        if (res?.error) errback(res.error);
                        else callback({id: res.id});
                    });
                });

                if (device.canProduce("audio")) {
                    const audioTrack = stream.getAudioTracks()[0];
                    if (audioTrack) {
                        console.log("Audio track found:", audioTrack, "Enabled:", audioTrack.enabled);
                        await sendTransportRef.current.produce({track: audioTrack});
                        console.log("Audio producer created successfully");
                    } else {
                        console.error("No audio track found in stream");
                    }
                } else {
                    console.error("Device cannot produce audio");
                }
                if (device.canProduce("video")) {
                    const videoTrack = stream.getVideoTracks()[0];
                    if (videoTrack) {
                        await sendTransportRef.current.produce({track: videoTrack});
                        console.log("Video producer created");
                    }
                }
            }


            const recvParams = await new Promise((resolve, reject) => {
                socket.emit("createWebRtcTransport", {direction: "recv"}, (data) => {
                    if (data.error) reject(data.error);
                    else resolve(data);
                });
            });

            recvTransportRef.current = device.createRecvTransport(recvParams);
            const recvTransport = recvTransportRef.current;

            recvTransport.on("connect", ({dtlsParameters}, callback, errback) => {
                socket.emit("connectTransport", {transportId: recvTransport.id, dtlsParameters}, (res) => {
                    if (res?.error) errback(res.error);
                    else callback();
                });
            });

            const producers = await new Promise((resolve) => socket.emit("getProducers", resolve));
            console.log("Existing producers:", producers);

            for (const prod of producers) {
                if (!producersMapRef.current.has(prod.producerId)) {
                    producersMapRef.current.set(prod.producerId, {
                        socketId: prod.socketId,
                        kind: prod.kind || "video",
                        name: prod.name,
                        userId: prod.userId,
                        peerRole: prod.peerRole,
                    });
                    await consumeProducer(prod.producerId);
                }
            }
        } catch (err) {
            console.error("setupMediasoup error:", err);
        }
    }

    async function consumeProducer(producerId) {
        try {
            const device = deviceRef.current;
            const recvTransport = recvTransportRef.current;
            if (!device || !recvTransport) {
                console.warn("Cannot consume: device or recvTransport not initialized");
                return;
            }
            for (const c of consumerMapRef.current.values()) {
                if (c.producerId === producerId) {
                    console.log("Producer already consumed:", producerId);
                    return;
                }
            }

            const consumerData = await new Promise((resolve, reject) => {
                socketRef.current.emit(
                    "consume",
                    {producerId, rtpCapabilities: device.rtpCapabilities, transportId: recvTransport.id},
                    (data) => {
                        if (data?.error) reject(data.error);
                        else {
                            console.log("Consumer data received:", data); // Log consumer data
                            resolve(data);
                        }
                    }
                );
            });

            const consumer = await recvTransport.consume(consumerData);
            consumerMapRef.current.set(consumer.id, consumer);

            const pinfo = producersMapRef.current.get(producerId) || {};
            const socketId = pinfo.socketId || consumer.producerId;

            setParticipants((prev) => {
                const idx = prev.findIndex((x) => x.socketId === socketId);
                let entry = idx !== -1 ? {...prev[idx]} : {
                    socketId,
                    userId: pinfo.userId,
                    name: pinfo.name || socketId,
                    role: pinfo.peerRole,
                    streams: {audio: null, video: null},
                };

                if (!entry.streams) entry.streams = {audio: null, video: null};

                if (consumer.track.kind === "audio") {
                    entry.streams.audio = new MediaStream([consumer.track]);
                    console.log("Audio stream created for", socketId);
                } else if (consumer.track.kind === "video") {
                    entry.streams.video = new MediaStream([consumer.track]);
                    console.log("Video stream created for", socketId);
                }

                if (idx !== -1) {
                    const copy = prev.slice();
                    copy[idx] = entry;
                    return copy;
                }
                return [...prev, entry];
            });

            await consumer.resume();

            console.log("Consumer resumed for producer:", producerId);
        } catch (err) {
            console.error("consumeProducer error:", err);
        }
    }

    const startRecording = (stream) => {
        if (!stream) return;
        mediaRecorderRef.current = new MediaRecorder(stream, {mimeType: "video/webm; codecs=vp8"});
        const startTime = Date.now();

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result;
                    if (result.startsWith("data:video/webm")) {
                        const base64Data = result.substring(result.lastIndexOf(",") + 1);
                        actionToSendVideoChunkDataToServer({
                            groupId: roomId,
                            data: base64Data,
                        });
                    } else {
                        console.error("Invalid Base64 MIME Type!", result.substring(0, 50));
                    }
                };
                reader.readAsDataURL(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            const duration = (Date.now() - startTime) / 1000;
            try {
                await actionToSendVideoChunkDataToServerFinishProcess(roomId, duration);
            } catch (e) {
                console.warn("Finish recording failed:", e);
            }
        };

        mediaRecorderRef.current.start(RECORD_INTERVAL);
    };

    const stopRecording = () => {
        try {
            mediaRecorderRef.current?.stop();
            mediaRecorderRef.current?.getTracks().forEach(t => t.stop());
        } catch (e) {
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.pause();
            setIsRecordingPaused(true);
            console.log("Recording paused");
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
            mediaRecorderRef.current.resume();
            setIsRecordingPaused(false);
            console.log("Recording resumed");
        }
    };


    const approveRequest = (socketId) => {
        socketRef.current.emit("join-response", {socketId, allow: true});
        setJoinRequests((prev) => prev.filter((r) => r.socketId !== socketId));
    };

    const rejectRequest = (socketId) => {
        socketRef.current.emit("join-response", {socketId, allow: false});
        setJoinRequests((prev) => prev.filter((r) => r.socketId !== socketId));
    };

    const kickUser = (socketId) => {
        socketRef.current.emit("kick-user", {targetSocketId: socketId});
        setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    };

    const endMeeting = () => {
        socketRef.current.emit("end-meeting", {roomId});
        stopRecording();
    };

    const toggleMute = () => {
        if (!mediaStreamRef.current) return;
        mediaStreamRef.current.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
        setMuted(m => !m);
    };

    const toggleVideo = () => {
        if (!mediaStreamRef.current) return;
        mediaStreamRef.current.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
        setVideoOff(v => !v);
    };

    const leaveCall = () => {
        socketRef.current.emit("leave-room", {roomId});
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        socketRef.current.disconnect();
        setJoined(false);
    };

    const startScreenShare = async () => {
        try {
            setMuted(false);
            // Get screen + system audio
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true // system audio if supported
            });

            console.log("Screen stream obtained:", screenStream.getTracks());
            mediaStreamRef.current = screenStream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            // Replace existing producers’ tracks
            const videoTrack = screenStream.getVideoTracks()[0];
            const audioTrack = screenStream.getAudioTracks()[0];

            if (videoTrack && sendTransportRef.current?.videoProducer) {
                await sendTransportRef.current.videoProducer.replaceTrack({track: videoTrack});
                console.log("Replaced camera video with screen video");
            } else if (videoTrack) {
                sendTransportRef.current.videoProducer = await sendTransportRef.current.produce({track: videoTrack});
                console.log("Screen video producer created");
            }

            if (audioTrack && sendTransportRef.current?.audioProducer) {
                await sendTransportRef.current.audioProducer.replaceTrack({track: audioTrack});
                console.log("Replaced mic audio with system audio");
            } else if (audioTrack) {
                sendTransportRef.current.audioProducer = await sendTransportRef.current.produce({track: audioTrack});
                console.log("System audio producer created");
            }

            setIsScreenSharing(true);

            // Restart recording with screen stream
            if (mediaRecorderRef.current?.state === "recording") {
                pauseRecording();
            }

            // Detect when user manually stops screen share
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
        } catch (err) {
            console.error("Screen share failed:", err);
        }
    };


    const stopScreenShare = async () => {
        try {
            // Get back camera + mic
            const camStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            console.log("Camera stream restored:", camStream.getTracks());
            mediaStreamRef.current = camStream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = camStream;
            }

            const videoTrack = camStream.getVideoTracks()[0];
            const audioTrack = camStream.getAudioTracks()[0];

            if (videoTrack && sendTransportRef.current?.videoProducer) {
                await sendTransportRef.current.videoProducer.replaceTrack({track: videoTrack});
                console.log("Restored camera video");
            }
            if (audioTrack && sendTransportRef.current?.audioProducer) {
                await sendTransportRef.current.audioProducer.replaceTrack({track: audioTrack});
                console.log("Restored mic audio");
            }

            setIsScreenSharing(false);

            // Restart recording with camera stream
            if (mediaRecorderRef.current?.state === "recording") {
                resumeRecording();
            }
        } catch (err) {
            console.error("Failed to stop screen share:", err);
        }
    };

    return (
        <div className="video-room-container">
            {waitingApproval && (
                <div className="waiting-approval-overlay">
                    <div className="loader-text">⏳ Waiting for host approval...</div>
                </div>
            )}

            <div className={`video-room ${waitingApproval ? 'hidden' : ''}`}>
                {/* Main Video */}
                <div className="main-video">
                    {isTeacher ? (
                        <video ref={localVideoRef} muted autoPlay playsInline/>
                    ) : (
                        <>
                            {participants.map((p) =>
                                    p.role === "teacher" && (
                                        <ParticipantThumbnail
                                            key={p.socketId}
                                            p={p}
                                            isTeacher={isTeacher}
                                        />
                                    )
                            )}
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                <div className="thumbnails-bar">
                    {!isTeacher && (
                        <div className="thumbnail self">
                            <video ref={localVideoRef} muted autoPlay playsInline/>
                        </div>
                    )}
                    {participants.map(
                        (p) =>
                            p.role !== "teacher" && (
                                <ParticipantThumbnail
                                    key={p.socketId}
                                    p={p}
                                    isTeacher={isTeacher}
                                    onKick={() => kickUser(p.socketId)}
                                />
                            )
                    )}
                </div>

                {/* Controls */}
                <div className="controls-bar">
                    {/* Mute / Unmute */}
                    <button onClick={toggleMute} className="control-btn" title={muted ? "Unmute" : "Mute"}>
                        {muted ? (
                            /* Mic Off Icon */
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none">
                                <path d="M12 1C13.6452 1 15.0585 1.99333 15.6728 3.41298L7.99997 11.0858V5C7.99997 2.79086 9.79083 1 12 1Z" fill="#ffffff"/>
                                <path d="M6.24997 12C6.24997 12.2632 6.26801 12.5245 6.30342 12.7823L4.25194 14.8338C3.92295 13.9344 3.74997 12.9761 3.74997 12V11.8438C3.74997 11.2915 4.19769 10.8438 4.74997 10.8438H5.24997C5.80226 10.8438 6.24997 11.2915 6.24997 11.8438V12Z" fill="#ffffff"/>
                                <path d="M7.3242 18.7971L3.76773 22.3535C3.3772 22.7441 2.74404 22.7441 2.35352 22.3535L1.64641 21.6464C1.25588 21.2559 1.25588 20.6227 1.64641 20.2322L20.2322 1.64644C20.6227 1.25591 21.2559 1.25591 21.6464 1.64644L22.3535 2.35354C22.744 2.74407 22.744 3.37723 22.3535 3.76776L16 10.1213V12C16 14.2091 14.2091 16 12 16C11.4457 16 10.9177 15.8873 10.4378 15.6835L9.13553 16.9857C9.99969 17.4822 10.986 17.75 12 17.75C13.525 17.75 14.9875 17.1442 16.0658 16.0659C17.1442 14.9875 17.75 13.525 17.75 12V11.8438C17.75 11.2915 18.1977 10.8438 18.75 10.8438H19.25C19.8023 10.8438 20.25 11.2915 20.25 11.8437V12C20.25 14.188 19.3808 16.2865 17.8336 17.8336C16.5842 19.0831 14.9753 19.8903 13.25 20.1548V23H10.75V20.1548C9.51944 19.9662 8.34812 19.5014 7.3242 18.7971Z" fill="#ffffff"/>
                            </svg>
                        ) : (
                            /* Mic On Icon */
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4z"/>
                                <path d="M19 11a7 7 0 0 1-14 0h2a5 5 0 0 0 10 0h2z"/>
                                <path d="M12 17v4m-4 0h8"/>
                            </svg>
                        )}
                    </button>

                    {/* Video On/Off */}
                    <button onClick={toggleVideo} className="control-btn" title={videoOff ? "Start Video" : "Stop Video"}>
                        {videoOff ? (
                            /* Camera Off */
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" className="icon" version="1.1" id="Capa_1" viewBox="0 0 520 520">
                                <g>
                                    <path d="M505.29,157.622c-9.005-5.568-20.585-6.075-30.037-1.342L397,195.244v-42.185c0-16.862-13.256-30.136-30.118-30.136   H183.734l-68.365-80.99c-10.883-12.866-30.131-14.591-43.027-3.685C59.476,49.14,57.866,68.36,68.764,81.233l335.867,396.909   c6.038,7.134,14.641,10.797,23.318,10.797c6.962,0,13.97-2.377,19.71-7.23c12.866-10.891,14.276-30.164,3.378-43.038L397,375.045   v-19.903l78.136,38.964c4.309,2.154,9.098,3.22,13.764,3.22c5.576,0,11.435-1.528,16.34-4.562   c8.99-5.561,14.76-15.386,14.76-25.971v-183.2C520,173.007,514.28,163.183,505.29,157.622z"/>
                                    <path d="M0,153.059v244.267c0,16.862,14.138,30.597,31,30.597h260.756L29.879,122.647C13.443,123.128,0,136.499,0,153.059z"/>
                                </g>
                            </svg>
                        ) : (
                            /* Camera On */
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 10.5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"/>
                            </svg>
                        )}
                    </button>

                    {/* Screen Share */}
                    {(isTeacher) &&
                    (
                        <>
                            {!isScreenSharing && (
                                <button
                                    onClick={isRecordingPaused ? resumeRecording : pauseRecording}
                                    className={`control-btn recorder-button ${!isRecordingPaused ? "recording" : ""}`}
                                    title={!isRecordingPaused ? "Pause Recording" : "Resume Recording"}
                                >
                                    {!isRecordingPaused ? (
                                        <>
                                            <span className="record-dot"></span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="record-paused">⏸</span>
                                        </>
                                    )}
                                </button>
                            )}


                            <button onClick={isScreenSharing ? stopScreenShare : startScreenShare} className="control-btn" title={isScreenSharing ? "Stop Share" : "Share Screen"}>
                                {isScreenSharing ? (
                                    /* Stop Share */
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M4 4h16v10H4z"/><path d="M2 18h20v2H2z"/><path d="M10 12h4v2h-4z"/>
                                    </svg>
                                ) : (
                                    /* Share */
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 28 28" version="1.1">
                                        <g id="System-Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                            <g id="ic_fluent_share_screen_28_filled" fill="#ffffff" fillRule="nonzero">
                                                <path d="M23.75,4.99939 C24.9926,4.99939 26,6.00675 26,7.24939 L26,7.24939 L26,20.75 C26,21.9926 24.9926,23 23.75,23 L23.75,23 L4.25,23 C3.00736,23 2,21.9926 2,20.75 L2,20.75 L2,7.24939 C2,6.00675 3.00736,4.99939 4.25,4.99939 L4.25,4.99939 Z M13.9975,8.62108995 C13.7985,8.62108995 13.6077,8.70032 13.467,8.84113 L10.217,12.0956 C9.92435,12.3887 9.92468,12.8636 10.2178,13.1563 C10.5109,13.449 10.9858,13.4487 11.2784,13.1556 L13.2477,11.1835 L13.2477,18.6285 C13.2477,19.0427 13.5835,19.3785 13.9977,19.3785 C14.4119,19.3785 14.7477,19.0427 14.7477,18.6285 L14.7477,11.1818 L16.7219,13.1559 C17.0148,13.4488 17.4897,13.4488 17.7826,13.1559 C18.0755,12.863 18.0755,12.3882 17.7826,12.0953 L14.5281,8.84076 C14.3873,8.70005 14.1965,8.62108995 13.9975,8.62108995 Z" id="🎨-Color">

                                                </path>
                                            </g>
                                        </g>
                                    </svg>
                                )}
                            </button>
                        </>
                    )
                    }

                    {/* End / Leave Call */}
                    <button onClick={isTeacher ? endMeeting : leaveCall} className="control-btn end" title={isTeacher ? "End Meeting" : "Leave Call"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none">
                            <path d="M10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C14.1588 20.0658 10.9183 19.5829 7.6677 16.3323C4.41713 13.0817 3.93421 9.84122 4.00655 7.93309C4.04952 6.7996 4.7008 5.77423 5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617Z" fill="#ffffff"/>
                        </svg>
                    </button>
                </div>


                {/* Join Requests */}
                {isTeacher && joinRequests.length > 0 && (
                    <div className="join-requests-panel">
                        <h4>Join Requests</h4>
                        {joinRequests.map((r) => (
                            <div key={r.socketId} className="request-item">
                                <span>{r.name || r.socketId}</span>
                                <div className="actions">
                                    <button
                                        className="approve-btn"
                                        onClick={() => approveRequest(r.socketId)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => rejectRequest(r.socketId)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ParticipantThumbnail({ p, isTeacher, onKick }) {
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (p?.streams?.video && videoRef.current) {
            videoRef.current.srcObject = p.streams.video;
            videoRef.current.play().catch(err => {
                console.warn("Video playback failed for", p.socketId, err);
            });
        }
        if (p?.streams?.audio && audioRef.current) {
            audioRef.current.srcObject = p.streams.audio;
            audioRef.current.play().catch(err => {
                console.warn("Audio playback failed for", p.socketId, err);
            });
        }
    }, [p]);

    return (
        <div className={`${p.role !== "teacher" ? 'thumbnail' : ''}`} data-role={p.role}>
            {p.streams?.video && <video ref={videoRef} autoPlay playsInline />}
            {p.streams?.audio && <audio ref={audioRef} autoPlay playsInline />}
            {isTeacher && p.role !== "teacher" && (
                <button onClick={onKick} className="kick-btn">Kick</button>
            )}
        </div>
    );
}
