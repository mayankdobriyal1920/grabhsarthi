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

/** Generate thumbnail File from a video File object.
 *  Returns { file: File, url: string } where url is an object URL for preview.
 */
async function generateVideoThumbnailFile(videoFile, seekTime = 1, quality = 0.8) {
    if (!videoFile || !isVideo(videoFile)) return null;
    const video = document.createElement("video");
    const src = URL.createObjectURL(videoFile);
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    // Some browsers require play() for currentTime/seek to work consistently when not user-initiated,
    // but it may still fail silently — we handle both events.
    try { await video.play().catch(() => {console.log('')}); } catch (e) {console.log('')}
    await new Promise((resolve, reject) => {
        const onMeta = () => { resolve(); };
        video.onloadedmetadata = onMeta;
        // safety timeout
        setTimeout(onMeta, 3000);
    });

    // Choose seek time: prefer 1s but if shorter choose middle
    let target = seekTime;
    if (video.duration && video.duration < seekTime) target = Math.max(0, video.duration / 2);
    // Seek and wait
    await new Promise((resolve) => {
        const onSeek = () => resolve();
        video.currentTime = Math.min(target, Math.max(0, (video.duration || 0) - 0.1));
        video.onseeked = onSeek;
        // fallback in case seeked doesn't fire
        setTimeout(resolve, 1500);
    });

    const canvas = document.createElement("canvas");
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 360;
    // scale down if huge
    const maxDim = Math.max(vw, vh);
    let scale = 1;
    if (maxDim > MAX_IMAGE_DIMENSION) scale = MAX_IMAGE_DIMENSION / maxDim;
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    // cleanup
    try { video.pause(); } catch (e) {console.log('')}
    URL.revokeObjectURL(src);

    if (!blob) return null;
    const thumbFileName = videoFile.name.replace(/\.[a-z0-9]+$/i, "") + "_thumb.jpg";
    const thumbFile = new File([blob], thumbFileName, { type: blob.type, lastModified: Date.now() });
    const thumbUrl = URL.createObjectURL(thumbFile);
    return { file: thumbFile, url: thumbUrl };
}

export default function AddCommunityPostModal({ isOpen, onClose }) {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);
    const [present] = useIonToast();

    const reset = () => {
        setMessage("");
        if (previewUrl) { URL.revokeObjectURL(previewUrl); }
        if (thumbnailUrl) { URL.revokeObjectURL(thumbnailUrl); }
        setAttachment(null);
        setPreviewUrl(null);
        setThumbnailFile(null);
        setThumbnailUrl(null);
        setErrors({});
        setSubmitting(false);
    };
    const closeAndReset = () => { reset(); onClose && onClose(); };

    const onPickFile = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        // clear previous
        if (previewUrl) { URL.revokeObjectURL(previewUrl); }
        if (thumbnailUrl) { URL.revokeObjectURL(thumbnailUrl); }
        setThumbnailFile(null);
        setThumbnailUrl(null);

        if (!isImage(file) && !isVideo(file)) {
            setErrors((p) => ({ ...p, attachment: "Only images or videos are allowed." }));
            e.target.value = "";
            return;
        }
        setErrors((p) => ({ ...p, attachment: "" }));
        setAttachment(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // If video, generate thumbnail for immediate upload/preview
        if (isVideo(file)) {
            try {
                const thumb = await generateVideoThumbnailFile(file);
                if (thumb) {
                    setThumbnailFile(thumb.file);
                    setThumbnailUrl(thumb.url);
                }
            } catch (err) {
                console.warn("Failed to generate video thumbnail:", err);
            }
        }
    };

    const removeAttachment = () => {
        if (previewUrl) { URL.revokeObjectURL(previewUrl); }
        if (thumbnailUrl) { URL.revokeObjectURL(thumbnailUrl); }
        setPreviewUrl(null);
        setAttachment(null);
        setThumbnailFile(null);
        setThumbnailUrl(null);
    };

    const validate = () => {
        const errs = {};
        if (!message || message.trim().length < 3) errs.message = "Please enter at least 3 characters.";
        if (attachment && !(isImage(attachment) || isVideo(attachment))) errs.attachment = "Only image/video files are allowed.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const onSubmit = async () => {
        if (!validate()) { present({ message: "Fix the errors before submitting.", duration: 1800, color: "danger" }); return; }
        setSubmitting(true);
        try {
            let finalFile = attachment;
            // compress image or video
            if (finalFile && isImage(finalFile)) {
                finalFile = await compressImage(finalFile);
            }

            // Generate thumbnail from final video file to ensure match with compressed video.
            let finalThumbnail = thumbnailFile;
            if (finalFile && isVideo(finalFile)) {
                try {
                    const gen = await generateVideoThumbnailFile(finalFile);
                    if (gen) finalThumbnail = gen.file;
                } catch (err) {
                    console.warn("Failed to regenerate thumbnail from final video:", err);
                    // fall back to previously generated thumbnailFile if available
                }
            }

            const object_type = finalFile ? (isImage(finalFile) ? "image" : "video") : "text";
            const formData = new FormData();
            formData.append("message", message.trim());
            formData.append("object_type", object_type);
            if (finalFile) formData.append("attachment", finalFile, finalFile.name); // field name MUST be 'attachment'
            if (finalThumbnail) formData.append("thumbnail", finalThumbnail, finalThumbnail.name); // server must accept 'thumbnail'
            // call api
            actionToPostNewCommunityPostData(formData);
            setSubmitting(false);
            closeAndReset();
        } catch (e) {
            console.error(e);
            present({ message: "Failed to upload post.", duration: 2000, color: "danger" });
            setSubmitting(false);
        }
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
                            {submitting ? "Preparing…" : "Post"}
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
