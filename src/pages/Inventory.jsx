import CarCard from "../components/CarCard.jsx";
import AddCar from "../components/AddCar.jsx";
import ImageManager from "../components/ImageManager.jsx";
import "./Inventory.css";
import {useEffect, useState} from "react";


export default function Inventory({ isAdmin }) {
    const [cars, setCars] = useState([]); //Start with empty cars array

    // Modal states
    const [showSpecsModal, setShowSpecsModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeCarId, setActiveCarId] = useState(null);

    //loads all cars from database
    const fetchCars = async () => {
        try {
            const response = await fetch("http://localhost/dealership-project/backend/api/get_cars.php");
            const result = await response.json();
            if (result.status === "success") setCars(result.data);
        } catch (error) {
            console.error("Could not get cars:", error);
        }
    };

    useEffect(() => { fetchCars(); }, []);

    // Save specs and open image modal
    const handleSpecsSuccess = (newCarId) => {
        setShowSpecsModal(false);
        setActiveCarId(newCarId);
        setShowImageModal(true);
    }

    // Save images
    const handleImagesDone = () => {
        setShowImageModal(false);
        setActiveCarId(null);
        fetchCars();
    };

    return (
        <div className="inventory-page">
            <h1>Current Inventory</h1>

            {/* Specs Modal */}
            {showSpecsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowSpecsModal(false)}>Close X</button>
                        <AddCar onSuccess={handleSpecsSuccess} />
                    </div>
                </div>
            )}

            {/* Images Modal */}
            {showImageModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* No close button here, force them to hit "Finish" inside */}
                        <ImageManager carId={activeCarId} onDone={handleImagesDone} />
                    </div>
                </div>
            )}

            <div className="car-grid">
                {cars.map((car) => (
                    <CarCard key={car.carid} car={car} isAdmin={isAdmin}/>))}
                {isAdmin && (
                    <div className="add-plus-card" onClick={() => setShowSpecsModal(true)}>
                        <div className="plus-icon">+</div>
                        <h3>Add New Listing</h3>
                    </div>
                )}
            </div>
        </div>
    );
};