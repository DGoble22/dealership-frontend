import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import ConfirmModal from "./ConfirmModal.jsx";
import {notifyError, notifySuccess} from "../utils/notify";
import "./CarForm.css";

export default function ImageManager({ carId, onDone }) {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("auth_token") || "";

    const [images, setImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true);
    const [isSavingCrop, setIsSavingCrop] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [uploadInputKey, setUploadInputKey] = useState(0);
    const [pendingDeletePicid, setPendingDeletePicid] = useState(null);

    // Cropper States
    const [imageSrc, setImageSrc] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    // percentage-based crop area — used to derive focal point, NOT for canvas crop
    const [croppedArea, setCroppedArea] = useState(null);

    // Focal point editing for already-uploaded images
    const [editingFocalPicid, setEditingFocalPicid] = useState(null);

    // Fetch Existing Images
    const fetchImages = useCallback(async () => {
        setIsLoadingImages(true);
        setStatusMessage("");
        try {
            const response = await fetch(API_URL + `/get_car_images?carid=${carId}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const result = await response.json();
            if (result.status === "success") {
                setImages(result.data || []);
                return;
            }
            setStatusMessage(result.message || "Unable to load images.");
        } catch {
            setStatusMessage("Unable to load images right now.");
        } finally {
            setIsLoadingImages(false);
        }
    }, [API_URL, carId, token]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    // Queue Logic
    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
            if (selected.length === 0) {
                setStatusMessage("Please select at least one valid image file.");
                return;
            }

            setStatusMessage("");
            setQueue(selected);
            setCurrentQueueIndex(0);
            loadNextInQueue(selected[0]);
        }
    };

    const loadNextInQueue = (file) => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedArea(null);

        const reader = new FileReader();
        reader.addEventListener("load", () => setImageSrc(reader.result));
        reader.readAsDataURL(file);
    };

    // react-easy-crop gives croppedArea as percentages of the image (0-100)
    const onCropComplete = useCallback((area) => setCroppedArea(area), []);

    const clearQueue = () => {
        setQueue([]);
        setCurrentQueueIndex(0);
        setImageSrc(null);
        setUploadInputKey((current) => current + 1);
    };

    const moveToNextQueuedImage = () => {
        const nextIndex = currentQueueIndex + 1;
        if (nextIndex < queue.length) {
            setCurrentQueueIndex(nextIndex);
            loadNextInQueue(queue[nextIndex]);
            return;
        }
        clearQueue();
    };

    // Upload the ORIGINAL file and derive focal point from the crop area center
    const handleSaveCrop = async () => {
        const currentFile = queue[currentQueueIndex];
        if (!currentFile || !croppedArea) return;

        // Center of the crop area in percentage coordinates
        const focal_x = Math.max(0, Math.min(100, Math.round(croppedArea.x + croppedArea.width / 2)));
        const focal_y = Math.max(0, Math.min(100, Math.round(croppedArea.y + croppedArea.height / 2)));

        setIsSavingCrop(true);
        setStatusMessage("");
        try {
            const formData = new FormData();
            formData.append("carid", carId);
            formData.append("image", currentFile);
            formData.append("focal_x", focal_x);
            formData.append("focal_y", focal_y);

            const res = await fetch(API_URL + "/add_single_image", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });
            const result = await res.json();

            if (result.status === "success") {
                await fetchImages();
                notifySuccess("Image uploaded.");
                moveToNextQueuedImage();
            } else {
                setStatusMessage(result.message || "Unable to upload image.");
                notifyError(result.message || "Unable to upload image.");
            }
        } catch {
            setStatusMessage("Unable to upload image.");
            notifyError("Unable to upload image.");
        } finally {
            setIsSavingCrop(false);
        }
    };

    const handleSkipCurrent = () => {
        moveToNextQueuedImage();
    };

    const handleCancelBatch = () => {
        clearQueue();
        setStatusMessage("");
    };

    // 4. Delete Logic
    const handleDelete = async (picid) => {
        setPendingDeletePicid(picid);
    };

    const confirmDelete = async () => {
        if (!pendingDeletePicid) {
            return;
        }

        const res = await fetch(API_URL + "/delete_image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ carid: carId, picid: pendingDeletePicid })
        });
        const result = await res.json();
        if (result.status === "success") {
            setImages((prev) => prev.filter((img) => img.picid !== pendingDeletePicid));
            notifySuccess("Image deleted.");
            setPendingDeletePicid(null);
            return;
        }
        setStatusMessage(result.message || "Unable to delete image.");
        notifyError(result.message || "Unable to delete image.");
        setPendingDeletePicid(null);
    };

    // Set Main Logic
    const handleSetMain = async (picid) => {
        const res = await fetch(API_URL + "/set_is_main", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ carid: carId, picid: picid })
        });
        const result = await res.json();
        if (result.status === "success") {
            const updated = images.map((img) => ({ ...img, is_main: img.picid === picid ? 1 : 0 }));
            setImages(updated);
            notifySuccess("Main image updated.");
            return;
        }
        setStatusMessage(result.message || "Unable to set main image.");
        notifyError(result.message || "Unable to set main image.");
    };

    // Focal point editing for existing images
    const handleImageCardClick = (e, img) => {
        if (editingFocalPicid !== img.picid) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
        const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
        saveFocalPoint(img.picid, x, y);
        setEditingFocalPicid(null);
    };

    const saveFocalPoint = async (picid, focal_x, focal_y) => {
        setImages((prev) => prev.map((img) => img.picid === picid ? { ...img, focal_x, focal_y } : img));
        try {
            const res = await fetch(API_URL + "/set_focal_point", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ carid: carId, picid, focal_x, focal_y }),
            });
            const result = await res.json();
            if (result.status !== "success") notifyError("Failed to save position.");
        } catch {
            notifyError("Failed to save position.");
        }
    };

    const queuedTotal = queue.length;
    const queuedPosition = currentQueueIndex + 1;
    const hasNextQueuedImage = currentQueueIndex + 1 < queue.length;
    const currentFileName = queue[currentQueueIndex]?.name || "";

    return (
        <div className="image-manager">
            <div className="car-form-hero image-manager-hero">
                <p className="car-form-eyebrow">Vehicle Listing</p>
                <h2>Manage Photos</h2>
                <p>Frame each photo then upload. Clicking to enlarge always shows the full original.</p>
            </div>

            {statusMessage && <p className="image-status-message" role="status">{statusMessage}</p>}

            {/* CROPPER Modal */}
            {imageSrc ? (
                <div className="cropper-section">
                    <div className="cropper-header-row">
                        <p className="crop-progress">Framing {queuedPosition} / {queuedTotal}</p>
                        {currentFileName && <p className="crop-filename">{currentFileName}</p>}
                    </div>

                    <div className="cropper-container">
                        <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={16/9}
                                 onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                    </div>

                    <div className="zoom-controls">
                        <label htmlFor="crop-zoom">Zoom</label>
                        <input
                            id="crop-zoom"
                            className="zoom-range"
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                        />
                        <span>{zoom.toFixed(2)}x</span>
                    </div>

                    <div className="crop-controls">
                        <button
                            type="button"
                            onClick={hasNextQueuedImage ? handleSkipCurrent : handleCancelBatch}
                            className="crop-cancel-btn"
                            disabled={isSavingCrop}
                        >
                            {hasNextQueuedImage ? "Skip Photo" : "Cancel Batch"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveCrop}
                            className="crop-save-btn"
                            disabled={isSavingCrop}
                        >
                            {isSavingCrop ? "Uploading..." : hasNextQueuedImage ? "Upload & Next" : "Upload & Finish"}
                        </button>
                    </div>
                </div>
            ) : (
                /* GALLERY GRID */
                <div className="manager-content">
                    <div className="image-grid">
                        {!isLoadingImages && images.length === 0 && (
                            <div className="image-empty-state">
                                <p>No photos uploaded yet. Add a few photos to complete the listing.</p>
                            </div>
                        )}

                        {images.map((img) => (
                            <div
                                key={img.picid}
                                className={`image-card${editingFocalPicid === img.picid ? " focal-mode" : ""}`}
                                onClick={(e) => handleImageCardClick(e, img)}
                            >
                                <img
                                    src={img.image_path}
                                    alt="car"
                                    style={{ objectPosition: `${img.focal_x ?? 50}% ${img.focal_y ?? 50}%` }}
                                />
                                <span
                                    className="focal-dot"
                                    style={{ left: `${img.focal_x ?? 50}%`, top: `${img.focal_y ?? 50}%` }}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setEditingFocalPicid(editingFocalPicid === img.picid ? null : img.picid); }}
                                    className={`img-btn focal-btn${editingFocalPicid === img.picid ? " active" : ""}`}
                                    aria-label="Reposition" title="Reposition"
                                >⊕</button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(img.picid); }} className="img-btn delete-btn" aria-label="Delete image">×</button>
                                {img.is_main === 0 && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleSetMain(img.picid); }} className="img-btn main-btn" aria-label="Set as main image">★</button>
                                )}
                                {img.is_main === 1 && <span className="main-badge">Main</span>}
                                {editingFocalPicid === img.picid && (
                                    <div className="focal-mode-hint">Click to set position</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="image-manager-toolbar">
                        <label className="upload-btn" htmlFor="image-upload-input">
                            Add Photos
                        </label>
                        <input
                            key={uploadInputKey}
                            id="image-upload-input"
                            className="image-upload-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onFileChange}
                        />
                        <button type="button" onClick={onDone} className="submit-btn image-manager-finish-btn">Finish & Close</button>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={pendingDeletePicid !== null}
                title="Delete Image"
                message="Delete this image from the listing?"
                confirmText="Delete"
                cancelText="Keep"
                onConfirm={confirmDelete}
                onCancel={() => setPendingDeletePicid(null)}
            />
        </div>
    );
}