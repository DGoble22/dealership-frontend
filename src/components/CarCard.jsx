import "./CarCard.css";
import React, {useState} from "react";
import {createPortal} from "react-dom";
import UpdateCar from "../components/UpdateCar.jsx";
import ImageManager from "../components/ImageManager.jsx";

const CarCard = ({car, isAdmin}) =>  {
    const [showForm, setShowForm] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showImageManager, setShowImageManager] = useState(false);

    const handleOpenGallery = async () => {
        setShowGallery(true);
        if(galleryImages.length > 0) return; //Gallery already loaded

        try{
            const response = await fetch(`http://localhost/dealership-project/backend/api/get_car_images.php?carid=${car.carid}`);
            const result = await response.json();

            if(result.status === "success") {
                setGalleryImages(result.data);
            } else {
                alert("Could not load gallery: " + result.message);
                setShowGallery(false);
            }
        } catch (e) {
            console.error("Gallery fetch failed: ", e);
        }
    }

    // Gallery navigation functions
    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (window.confirm('Delete ' + car.year + ' ' + car.model + '?')) {
            try{
                const response = await fetch(`http://localhost/dealership-project/backend/api/delete_car.php`, {
                method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({carid: car.carid}),
            });
            const result = await response.json();

            if (result.status === "success") {
                alert(result.message)
                window.location.reload();
            }
            } catch (error){
                console.error("Could not delete car:", error);
            }
        }
    };

    const handleSuccess = () => {
        setShowForm(false);
        window.location.reload();
    }

    return (
            <div className="car-card">
                {/* Header */}
                <div className="car-header">
                    <h1>{car.year} {car.make} {car.model}</h1>
                    {car.trim && <h2>{car.trim}</h2>}
                </div>

                {/* Photo */}
                <div className="car-image" onClick={handleOpenGallery}>
                    <img src={car.image_path} alt="Car" />
                </div>

                {/* Details */}
                <div className="car-info">
                    <p><strong>Price</strong> <span>${car.price?.toLocaleString()}</span></p>
                    <p><strong>Mileage</strong> <span>{car.miles?.toLocaleString()} mi</span></p>
                    <p><strong>VIN</strong> <span>{car.vin}</span></p>
                    <p>
                        <strong>Status</strong>
                        <span className={`status-badge status-${car.status.toLowerCase()}`}>
                            {car.status}
                        </span>
                    </p>
                </div>

                {/* Description */}
                {car.description && (
                    <div className="car-description">
                        <h3>Description</h3>
                        <p>{car.description}</p>
                    </div>
                )}

                {/* Admin Action Buttons */}
                {isAdmin && (
                    <div className="car-actions">
                        <button className="btn-delete" onClick={handleDelete}>X</button>
                        <button className="btn-edit" onClick={() => setShowForm(true)}>Specs</button>
                        <button className="btn-edit" onClick={() => setShowImageManager(true)}>Photos</button>
                    </div>
                )}

                {/* Modal overlay for update car using portal to document body */}
                {showForm && createPortal(
                    <div className="modal-overlay" onClick={() => setShowForm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-btn" onClick={() => setShowForm(false)}>Close X</button>
                            <UpdateCar car={car} onSuccess={handleSuccess} />
                        </div>
                    </div>,
                    document.body
                )}

                {/* Modal overlay for image manager */}
                {showImageManager && createPortal(
                    <div className="modal-overlay" onClick={() => setShowImageManager(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <ImageManager carId={car.carid} onDone={() => {
                                setShowImageManager(false);
                                setGalleryImages([]);
                                window.location.reload();
                            }} />
                        </div>
                    </div>,
                    document.body
                )}

                {/* Modal overlay for car gallery*/}
                {showGallery && createPortal(
                    <div className="modal-overlay gallery-theme" onClick={() => setShowGallery(false)}>
                        <div className="modal-content gallery-box" onClick={(e) => e.stopPropagation()}>
                            <button className="gallery-close" onClick={() => setShowGallery(false)}>X</button>

                            {/* Main images */}
                            <div className="gallery-slider">
                                {galleryImages.length > 0 ? (
                                    <>
                                        <div
                                            className="gallery-click-zone left"
                                            onClick={prevImage}
                                        />
                                        <img src={galleryImages[currentIndex].image_path} alt="Gallery" className="main-gallery-img"/>
                                        <div
                                            className="gallery-click-zone right"
                                            onClick={nextImage}
                                        />
                                        {galleryImages.length > 1 && (
                                            <div className="gallery-nav">
                                                <button onClick={prevImage}>&#10094;</button>
                                                <button onClick={nextImage}>&#10095;</button>
                                            </div>
                                        )}

                                    </>
                                ) : <p>Loading Gallery...</p>}
                            </div>

                            {/* Thumbnail Strip */}
                            {galleryImages.length > 1 && (
                                <div className="gallery-thumbnails">
                                    {galleryImages.map((img, index) => (
                                        <div key={index} className={`thumb-item ${index === currentIndex ? 'active-thumb' : ''}`} onClick={() => setCurrentIndex(index)} >
                                            <img src={img.image_path} alt={`Thumbnail ${index + 1}`} className="thumb-img"/>
                                        </div>

                                        ))}
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
    );
};

export default CarCard;