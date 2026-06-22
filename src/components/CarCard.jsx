import "./CarCard.css";
import React, {useState} from "react";
import {createPortal} from "react-dom";
import {useNavigate} from "react-router-dom";
import UpdateCar from "../components/UpdateCar.jsx";
import ImageManager from "../components/ImageManager.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import useBodyModalLock from "../hooks/useBodyModalLock";
import {notifyError, notifySuccess} from "../utils/notify";

const CarCard = ({car, isAdmin, onInventoryChanged}) =>  {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [showImageManager, setShowImageManager] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    useBodyModalLock(showForm || showImageManager || showDeleteConfirm);

    const openDetails = () => {
        navigate(`/cars/${car.carid}`);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        const token = localStorage.getItem("auth_token") || "";

        try {
            const response = await fetch(API_URL + "/delete_car", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({carid: car.carid}),
            });
            const result = await response.json();

            if (result.status === "success") {
                notifySuccess(result.message || "Vehicle deleted.");
                onInventoryChanged?.();
            } else {
                notifyError(result.message || "Could not delete vehicle.");
            }
        } catch (error) {
            console.error("Could not delete car:", error);
            notifyError("Could not delete vehicle.");
        }
    };

    const handleSuccess = () => {
        setShowForm(false);
        onInventoryChanged?.();
    }

    return (
            <div className="car-card">
                <div className="car-image" onClick={openDetails}>
                    <img src={car.image_path} alt={`${car.year} ${car.make} ${car.model}`} />
                    {isAdmin && (
                        <button
                            className="btn-delete"
                            onClick={(event) => {
                                event.stopPropagation();
                                setShowDeleteConfirm(true);
                            }}
                        >
                            X
                        </button>
                    )}
                </div>

                <div className="car-content" onClick={openDetails}>
                    <div className="car-header">
                        <h1>{car.year} {car.make} {car.model}</h1>
                        {car.trim && <h2>{car.trim}</h2>}
                    </div>

                    <div className="car-info">
                        <p><strong>Price</strong> <span>${car.price?.toLocaleString()}</span></p>
                        <p><strong>Mileage</strong> <span>{car.miles?.toLocaleString()} mi</span></p>
                        <p>
                            <strong>Status</strong>
                            <span className={`status-badge status-${car.status.toLowerCase()}`}>
                                {car.status}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="car-actions">
                    <button className="btn-view" onClick={openDetails}>View Details</button>
                    {isAdmin && (
                        <div className="car-admin-actions">
                            <button className="btn-edit" onClick={() => setShowForm(true)}>Specs</button>
                            <button className="btn-edit" onClick={() => setShowImageManager(true)}>Photos</button>
                        </div>
                    )}
                </div>

                {/* Modal overlay for update car using portal to document body */}
                {showForm && createPortal(
                    <div className="modal-overlay" onClick={() => setShowForm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="close-btn" aria-label="Close modal" onClick={() => setShowForm(false)}>×</button>
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
                                onInventoryChanged?.();
                            }} />
                        </div>
                    </div>,
                    document.body
                )}

                <ConfirmModal
                    open={showDeleteConfirm}
                    title="Delete Vehicle"
                    message={`Delete ${car.year} ${car.make} ${car.model}? This cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Keep"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
    );
};

export default CarCard;