import React, { useState} from "react";
import {notifyError, notifySuccess} from "../utils/notify";
import ConfirmModal from "./ConfirmModal.jsx";
import "./CarForm.css";

export default function UpdateCar({car, onSuccess}) {
    const API_URL = import.meta.env.VITE_API_URL;
    const makeOptions = ["Chevrolet", "GMC"];
    const modelOptions = ["Caprice", "Tahoe", "Impala", "Sierra", "Silverado"];
    const driveTypeOptions = ["FWD", "RWD", "AWD", "4WD"];
    const statusOptions = ["Available", "Pending", "Sold", "Hidden"];

    const [formData, setFormData] = useState({
        carid: car.carid,
        make: "",
        model: "",
        trim: "",
        year: "",
        miles: "",
        price: "",
        vin: "",
        color: "",
        drivetype: "",
        status: "",
        description: ""
    });
    const [notifySubscribers, setNotifySubscribers] = useState(false);
    const [showNoNotifyConfirm, setShowNoNotifyConfirm] = useState(false);

    const buildFilteredData = () => Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
            if (key === "carid") return true;
            return value !== "" && value !== null && value !== undefined;
        })
    );

    // Helper function to handle changes in form inputs. It updates the formData state with the new values as the user types or selects options. The function uses the name attribute of the input fields to determine which part of the formData to update.
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filteredData = buildFilteredData();

        // Check to see if there are values to update
        if (Object.keys(filteredData).length <= 1) {
            notifyError("Please fill out at least one field to update.");
            return;
        }
        if (!notifySubscribers) {
            setShowNoNotifyConfirm(true);
            return;
        }
        doSubmit();
    };

    const doSubmit = async () => {
        const token = localStorage.getItem("auth_token") || "";
        const filteredData = buildFilteredData();

        try {
            const responce = await fetch(API_URL + "/update_car", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(filteredData),
            });

            const result = await responce.json();
            if (result.status === "success") {
                if (notifySubscribers) {
                    try {
                        const notifyPayload = { carid: formData.carid, notify_type: "updated" };
                        if (filteredData.price !== undefined && Number(filteredData.price) < Number(car.price)) {
                            notifyPayload.old_price = car.price;
                        }
                        await fetch(API_URL + "/mail/notify_new_car", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify(notifyPayload),
                        });
                    } catch {
                        // Non-fatal — car was still updated
                    }
                }
                notifySuccess(result.message || "Vehicle updated.");
                onSuccess();
            } else {
                notifyError(result.message || "Could not update vehicle.");
            }
        } catch (e) {
            console.error("Submission Failed: ", e);
            notifyError("Submission failed. Please try again.");
        }
    };

    // Default Year Values
    const years = Array.from({ length: 2026 - 1950 + 1}, (_, i) => 2026 - i);

    const setFieldValue = (name, value) => {
        setFormData((current) => ({ ...current, [name]: value }));
    };

    return (
        <>
        <form className="car-form" onSubmit={handleSubmit}>
            <div className="car-form-hero">
                <p className="car-form-eyebrow">Vehicle Listing</p>
                <h2>Vehicle Details</h2>
            </div>

            {/* Form Grid: Make, Model, Trim, Year, Miles, Price, VIN, Status */ }
            <div className="form-grid">
                <div className="field-wrap">
                    <label htmlFor="make">Make</label>
                    <input list="make-options" type="text" id="make" name="make" value={formData.make} placeholder={car.make} onChange={handleChange} />
                    <div className="quick-picks" aria-label="Make suggestions">
                        {makeOptions.map((option) => (
                            <button key={option} type="button" className="quick-pick-btn" onClick={() => setFieldValue("make", option)}>{option}</button>
                        ))}
                    </div>
                </div>
                <div className="field-wrap">
                    <label htmlFor="model">Model</label>
                    <input list="model-options" type="text" id="model" name="model" value={formData.model} placeholder={car.model} onChange={handleChange} />
                    <div className="quick-picks" aria-label="Model suggestions">
                        {modelOptions.slice(0, 4).map((option) => (
                            <button key={option} type="button" className="quick-pick-btn" onClick={() => setFieldValue("model", option)}>{option}</button>
                        ))}
                    </div>
                </div>
                <div className="field-wrap">
                    <label htmlFor="trim">Trim</label>
                    <input type="text" id="trim" name="trim" value={formData.trim} placeholder={car.trim} onChange={handleChange} />
                </div>
                <div className="field-wrap">
                    <label htmlFor="year">Year</label>
                    <select id="year" name="year" onChange={handleChange} value={formData.year} >
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="field-wrap">
                    <label htmlFor="miles">Miles</label>
                    <input type="number" id="miles" name="miles" placeholder={car.miles} onChange={handleChange} />
                </div>
                <div className="field-wrap">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" name="price" placeholder={car.price} onChange={handleChange} />
                </div>
                <div className="field-wrap">
                    <label htmlFor="vin">VIN</label>
                    <input type="text" id="vin" name="vin" value={formData.vin} placeholder={car.vin} onChange={handleChange} />
                </div>
                <div className="field-wrap">
                    <label htmlFor="color">Color</label>
                    <input list="color-options" type="text" id="color" name="color" value={formData.color} placeholder={car.color || "Black"} onChange={handleChange} />
                </div>
                <div className="field-wrap">
                    <label htmlFor="drivetype">Drive Type</label>
                    <div className="toggle-group" role="group" aria-label="Drive type selection">
                        {driveTypeOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`toggle-btn ${formData.drivetype === option ? "active" : ""}`}
                                onClick={() => setFieldValue("drivetype", option)}
                                aria-pressed={formData.drivetype === option}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="field-wrap">
                    <label>Status</label>
                    <div className="toggle-group" role="group" aria-label="Status selection">
                        {statusOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`toggle-btn ${formData.status === option ? "active" : ""}`}
                                onClick={() => setFieldValue("status", option)}
                                aria-pressed={formData.status === option}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Extra Forum Elements: Description, submit */ }
            <div className="field-wrap field-wrap-full">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" placeholder={car.description} onChange={handleChange} />
            </div>
            <label className="notify-checkbox-wrap">
                <input
                    type="checkbox"
                    checked={notifySubscribers}
                    onChange={(e) => setNotifySubscribers(e.target.checked)}
                />
                Notify email subscribers about this listing
            </label>
            <button type="submit" className="submit-btn">Update</button>

            <datalist id="make-options">
                {makeOptions.map((option) => <option key={option} value={option} />)}
            </datalist>
            <datalist id="model-options">
                {modelOptions.map((option) => <option key={option} value={option} />)}
            </datalist>
        </form>
        <ConfirmModal
            open={showNoNotifyConfirm}
            title="Skip subscriber notification?"
            message="You haven't checked 'Notify subscribers'. Submit without sending an email to subscribers?"
            confirmText="Submit Anyway"
            cancelText="Go Back"
            onConfirm={() => { setShowNoNotifyConfirm(false); doSubmit(); }}
            onCancel={() => setShowNoNotifyConfirm(false)}
        />
        </>
    );
}