import React, { useRef, useState } from "react";
import {
    IonModal,
    IonContent,
    IonIcon,
    useIonToast,
    IonHeader, IonToolbar, IonButtons, IonButton
} from "@ionic/react";
import {imageOutline, filmOutline, cloudUploadOutline, trashOutline, arrowBack} from "ionicons/icons";
import {actionToPostNewCommunityPostData} from "../apiHelper/CommonAction";

const MAX_IMAGE_DIMENSION = 1280;
const IMAGE_QUALITY = 0.8;

function isImage(file) { return /^image\//.test(file?.type || ""); }
function isVideo(file) { return /^video\//.test(file?.type || ""); }

async function compressImage(file) {
    if (!file || !isImage(file)) return file;
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    try {
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const ratio = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio), h = Math.round(img.height * ratio);
        canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
        const blob = await new Promise((res) => canvas.toBlob(res, file.type || "image/jpeg", IMAGE_QUALITY));
        if (!blob) return file;
        return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, "_compressed.$1"), { type: blob.type, lastModified: Date.now() });
    } finally { URL.revokeObjectURL(url); }
}

async function compressVideo(file) {
    if (!file || !isVideo(file)) return file;
    const testVideo = document.createElement("video");
    const canCapture = typeof testVideo.captureStream === "function";
    const canRecord = typeof window.MediaRecorder !== "undefined";
    if (!canCapture || !canRecord) return file;
    const video = document.createElement("video");
    const src = URL.createObjectURL(file);
    video.src = src; video.muted = true; video.playsInline = true;
    await video.play().catch(() => {console.log('')});
    await new Promise((r) => (video.onloadedmetadata = r));
    const stream = video.captureStream();
    const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm", bitsPerSecond: 1200000 });
    const chunks = []; rec.ondataavailable = (e) => e.data && chunks.push(e.data);
    const done = new Promise((resolve) => (rec.onstop = resolve));
    rec.start();
    const maxDur = Math.min(video.duration || 30, 30);
    await new Promise((resolve) => setTimeout(resolve, (maxDur + 0.2) * 1000));
    rec.stop(); await done; video.pause(); URL.revokeObjectURL(src);
    if (!chunks.length) return file;
    const outBlob = new Blob(chunks, { type: chunks[0].type || "video/webm" });
    return new File([outBlob], file.name.replace(/\.[a-z0-9]+$/i, "_compressed.webm"), { type: outBlob.type, lastModified: Date.now() });
}

export default function AddCommunityPostModal({ isOpen, onClose }) {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);
    const [present] = useIonToast();


    const reset = () => { setMessage(""); setAttachment(null); setPreviewUrl(null); setErrors({}); setSubmitting(false); };
    const closeAndReset = () => { reset(); onClose && onClose(); };


    const onPickFile = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!isImage(file) && !isVideo(file)) { setErrors((p) => ({ ...p, attachment: "Only images or videos are allowed." })); e.target.value = ""; return; }
        setErrors((p) => ({ ...p, attachment: "" })); setAttachment(file);
        const url = URL.createObjectURL(file); setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
    };


    const removeAttachment = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setAttachment(null);
    };


    const validate = () => {
        const errs = {}; if (!message || message.trim().length < 3) errs.message = "Please enter at least 3 characters."; if (attachment && !(isImage(attachment) || isVideo(attachment))) errs.attachment = "Only image/video files are allowed."; setErrors(errs); return Object.keys(errs).length === 0;
    };


    const onSubmit = async () => {
        if (!validate()) { present({ message: "Fix the errors before submitting.", duration: 1800, color: "danger" }); return; }
        setSubmitting(true);
        try {
            let finalFile = attachment;
            if (finalFile && isImage(finalFile)) finalFile = await compressImage(finalFile);
            else if (finalFile && isVideo(finalFile)) finalFile = await compressVideo(finalFile);
            const object_type = finalFile ? (isImage(finalFile) ? "image" : "video") : "text";
            const formData = new FormData();
            formData.append("message", message.trim());
            formData.append("object_type", object_type);
            if (finalFile) formData.append("attachment", finalFile, finalFile.name); // field name MUST be 'attachment'
            console.log("community_post form formData =>", { message: message.trim(), object_type, attachment: finalFile && { name: finalFile.name, type: finalFile.type, size: finalFile.size } });
            console.log('test',formData);
            actionToPostNewCommunityPostData(formData);
            setSubmitting(false);
            //closeAndReset();
        } catch (e) { console.error(e); present({ message: "Failed to upload post.", duration: 2000, color: "danger" }); setSubmitting(false); }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={closeAndReset} className="new-community-post-modal community-post-page">
            <IonHeader className="community-post-page-header sub-page-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={()=>closeAndReset()}>
                            <IonIcon icon={arrowBack}></IonIcon>
                        </IonButton>
                    </IonButtons>
                    <div className={"header_title_sub_header"}>
                        Create Post
                    </div>
                    <IonButtons slot="end">
                        <button type={"button"} onClick={onSubmit} disabled={submitting || (!previewUrl && !message?.trim()?.length)} className="ncp-post">
                            Post
                        </button>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {/* Form Body */}
                <div className="ncp-body">
                    {/* Custom Textarea */}
                    <div className="ncp-textarea-wrap">
                        <textarea
                            className="ncp-textarea"
                            value={message}
                            placeholder="What's on your mind?"
                            maxLength={500}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <div className="ncp-charcount">{message.length}/500</div>
                    </div>
                    {errors.message && <div className="error-text">{errors.message}</div>}

                    {/* Instagram-like preview tile with delete */}
                    {previewUrl ? (
                            <div className="ncp-preview-tile">
                                {attachment && isImage(attachment) ? (
                                    <img src={previewUrl} alt="preview" />
                                ) : (
                                    <video src={previewUrl || undefined} controls />
                                )}
                                <button className="ncp-delete" onClick={removeAttachment} aria-label="Remove attachment">
                                    <IonIcon icon={trashOutline} />
                                </button>
                            </div>
                        ):
                        <>
                            {/* Attachment picker */}
                            <div className="ncp-attach-row">
                                <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onPickFile} style={{ display: "none" }} />
                                <button className="ncp-attach-btn" onClick={() => inputRef.current?.click()}>
                                    <IonIcon icon={cloudUploadOutline} />
                                    <span>Add photo/video</span>
                                </button>
                                {attachment && (
                                    <div className="ncp-attach-meta">
                                        <IonIcon icon={isImage(attachment) ? imageOutline : filmOutline} />
                                        <span className="file-name">{attachment.name}</span>
                                    </div>
                                )}
                            </div>
                            {errors.attachment && <div className="error-text">{errors.attachment}</div>}
                        </>
                    }
                </div>
            </IonContent>
        </IonModal>
    );
}
