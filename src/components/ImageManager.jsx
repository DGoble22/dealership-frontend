import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImage from "./cropImage.jsx";
import "./CarFourm.css";

export default function ImageManager({ carId, onDone }) {
    const [images, setImages] = useState([]);

    // Cropper States
    const [imageSrc, setImageSrc] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Fetch Existing Images
    useEffect(() => {
        fetch(`http://localhost/dealership-project/backend/api/get_car_images.php?carid=${carId}`)
            .then(res => res.json())
            .then(res => { if(res.status === 'success') setImages(res.data); });
    }, [carId]);

    // Queue Logic
    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = Array.from(e.target.files);
            setQueue(selected);
            setCurrentQueueIndex(0);
            loadNextInQueue(selected[0]);
        }
    };

    const loadNextInQueue = (file) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => setImageSrc(reader.result));
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels), []);

    // Upload Logic (Single File)
    const handleSaveCrop = async () => {
        try {
            const croppedFile = await getCroppedImage(imageSrc, croppedAreaPixels);
            const formData = new FormData();
            formData.append("carid", carId);
            formData.append("image", croppedFile);

            // Calls the script we discussed earlier
            const res = await fetch("http://localhost/dealership-project/backend/api/add_single_image.php", {
                method: "POST", body: formData
            });
            const result = await res.json();

            if (result.status === "success") {
                setImages(prev => [...prev, result.data]); // Update Grid

                // Next Image
                const nextIndex = currentQueueIndex + 1;
                if (nextIndex < queue.length) {
                    setCurrentQueueIndex(nextIndex);
                    loadNextInQueue(queue[nextIndex]);
                } else {
                    setImageSrc(null); // Done with queue
                    setQueue([]);
                }
            }
        } catch (e) { console.error(e); }
    };

    // 4. Delete Logic
    const handleDelete = async (picid) => {
        if(!confirm("Delete image?")) return;
        const res = await fetch("http://localhost/dealership-project/backend/api/delete_image.php", {
            method: "POST", body: JSON.stringify({ carid: carId, picid: picid })
        });
        const result = await res.json();
        if(result.status === "success") {
            setImages(prev => prev.filter(img => img.picid !== picid));
        }
    };

    // 5. Set Main Logic
    const handleSetMain = async (picid) => {
        const res = await fetch("http://localhost/dealership-project/backend/api/set_is_main.php", {
            method: "POST", body: JSON.stringify({ carid: carId, picid: picid })
        });
        const result = await res.json();
        if(result.status === "success") {
            // Refresh list to show new star
            const updated = images.map(img => ({...img, is_main: img.picid === picid ? 1 : 0}));
            setImages(updated);
        }
    };

    return (
        <div className="image-manager">
            <h2>Manage Photos</h2>

            {/* CROPPER Modal */}
            {imageSrc ? (
                <div className="cropper-section">
                    <p>Cropping {currentQueueIndex + 1} / {queue.length}</p>
                    <div className="cropper-container">
                        <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={16/9}
                                 onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                    </div>
                    <button onClick={handleSaveCrop} className="crop-save-btn">Upload & Next</button>
                </div>
            ) : (
                /* GALLERY GRID */
                <div className="manager-content">
                    <div className="image-grid">
                        {images.map(img => (
                            <div key={img.picid} className="image-card">
                                <img src={img.image_path} alt="car" />
                                <button onClick={() => handleDelete(img.picid)} className="img-btn delete-btn">X</button>
                                {img.is_main === 0 && (
                                    <button onClick={() => handleSetMain(img.picid)} className="img-btn main-btn">★</button>
                                )}
                                {img.is_main === 1 && <span className="main-badge">Main</span>}
                            </div>
                        ))}
                    </div>
                    <input type="file" multiple onChange={onFileChange} />
                    <br /><br />
                    <button onClick={onDone} className="submit-btn">Finish & Close</button>
                </div>
            )}
        </div>
    );
}