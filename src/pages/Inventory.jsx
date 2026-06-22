import CarCard from "../components/CarCard.jsx";
import AddCar from "../components/AddCar.jsx";
import ImageManager from "../components/ImageManager.jsx";
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";
import useBodyModalLock from "../hooks/useBodyModalLock";
import "./Inventory.css";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";


export default function Inventory({ isAdmin }) {
    const isLoggedIn = !!localStorage.getItem("auth_token");
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [cars, setCars] = useState([]); //Start with empty cars array
    const [sortBy, setSortBy] = useState("price-low");
    const [showSoldVehicles, setShowSoldVehicles] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    // Modal states
    const [showSpecsModal, setShowSpecsModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeCarId, setActiveCarId] = useState(null);
    const latestFetchRef = useRef(0);
    useBodyModalLock(showSpecsModal || showImageModal);

    //loads all cars from database
    const fetchCars = useCallback(async () => {
        const fetchId = latestFetchRef.current + 1;
        latestFetchRef.current = fetchId;

        try {
            const token = isAdmin ? (localStorage.getItem("auth_token") || "") : "";
            const response = await fetch(API_URL + "/get_cars", {
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
            });
            const result = await response.json();

            // Ignore stale responses from earlier requests.
            if (fetchId !== latestFetchRef.current) {
                return;
            }

            if (result.status === "success") {
                setCars(result.data);
            }
        } catch (error) {
            if (fetchId === latestFetchRef.current) {
                console.error("Could not get cars:", error);
            }
        }
    }, [API_URL, isAdmin]);

    useEffect(() => { fetchCars(); }, [fetchCars]);

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

    const sortedCars = useMemo(() => {
        const filteredCars = cars.filter((car) => {
            const status = String(car?.status || "").trim().toLowerCase();

            if (isAdmin) {
                const visibleAdminStatuses = new Set(["available", "pending", "hidden"]);
                if (showSoldVehicles) {
                    visibleAdminStatuses.add("sold");
                }
                return visibleAdminStatuses.has(status);
            }

            return status === "available" || status === "pending";
        });

        const list = [...filteredCars];

        const getNumericValue = (car, field) => Number(car?.[field] ?? 0);

        switch (sortBy) {
            case "price-high":
                return list.sort((leftCar, rightCar) => getNumericValue(rightCar, "price") - getNumericValue(leftCar, "price"));
            case "price-low":
                return list.sort((leftCar, rightCar) => getNumericValue(leftCar, "price") - getNumericValue(rightCar, "price"));
            case "miles-high":
                return list.sort((leftCar, rightCar) => getNumericValue(rightCar, "miles") - getNumericValue(leftCar, "miles"));
            case "miles-low":
                return list.sort((leftCar, rightCar) => getNumericValue(leftCar, "miles") - getNumericValue(rightCar, "miles"));
            default:
                return list;
        }
    }, [cars, sortBy, isAdmin, showSoldVehicles]);

    return (
        <>
        <div className="inventory-page">
            <div className="inventory-header">
                <div>
                    <h1>Current Inventory</h1>
                    <p>Sort the lot by price or mileage to compare vehicles faster.</p>
                </div>

                <div className="inventory-sort">
                    <label htmlFor="inventory-sort-select">Sort by</label>
                    <select
                        id="inventory-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="miles-low">Miles: Low to High</option>
                        <option value="miles-high">Miles: High to Low</option>
                    </select>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className={`inventory-toggle-sold ${showSoldVehicles ? "active" : ""}`}
                        onClick={() => setShowSoldVehicles(!showSoldVehicles)}
                    >
                        {showSoldVehicles ? "Showing sold vehicles" : "Show sold vehicles"}
                    </button>
                )}
            </div>

            {/* Specs Modal */}
            {showSpecsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button type="button" className="close-btn" aria-label="Close modal" onClick={() => setShowSpecsModal(false)}>×</button>
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

            <div className={`car-grid ${isAdmin ? "car-grid-admin" : "car-grid-user"}`}>
                {!isAdmin && !isLoggedIn && (
                    <div className="inventory-signup-banner" style={{ gridColumn: "1 / -1" }}>
                        <div className="inventory-signup-banner-copy">
                            <p>Stay in the loop</p>
                            <h3>Get notified when new vehicles arrive</h3>
                        </div>
                        <div className="inventory-signup-banner-actions">
                            <button className="inventory-signup-btn" onClick={() => setShowRegister(true)}>Create an Account</button>
                            <button className="inventory-signup-btn inventory-signup-btn--ghost" onClick={() => setShowLogin(true)}>Sign In</button>
                        </div>
                    </div>
                )}
                {sortedCars.map((car) => (
                    <CarCard
                        key={car.carid}
                        car={car}
                        isAdmin={isAdmin}
                        onInventoryChanged={fetchCars}
                    />
                ))}
                {isAdmin && (
                    <div className="add-plus-card" onClick={() => setShowSpecsModal(true)}>
                        <div className="plus-icon">+</div>
                        <h3>Add New Listing</h3>
                    </div>
                )}
            </div>
        </div>
        {showRegister && (
            <Register
                onClose={() => setShowRegister(false)}
                onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
            />
        )}
        {showLogin && (
            <Login
                onClose={() => setShowLogin(false)}
                onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
            />
        )}
        </>
    );
};