import React, {useState} from "react";
import {notifyError, notifySuccess} from "../utils/notify";
import ConfirmModal from "./ConfirmModal.jsx";
import "./CarForm.css";

export default function AddCar({onSuccess}) {
    const API_URL = import.meta.env.VITE_API_URL;
    const makeOptions = ["Chevrolet", "GMC"];
    const modelOptions = ["Caprice", "Tahoe", "Impala", "Sierra", "Silverado"];
    const driveTypeOptions = ["FWD", "RWD", "AWD", "4WD"];
    const statusOptions = ["Available", "Pending", "Sold", "Hidden"];

    // Data to be sent to backend
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        trim: "",
        year: "",
        miles: "",
        price: "",
        vin: "",
        status: "Available",
        description: "",
        color: "",
        drivetype: ""
    });
    const [notifySubscribers, setNotifySubscribers] = useState(false);
    const [showNoNotifyConfirm, setShowNoNotifyConfirm] = useState(false);

    // Helper function to handle changes in form inputs. It updates the formData state with the new values as the user types or selects options. The function uses the name attribute of the input fields to determine which part of the formData to update.
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }

    const doSubmit = async () => {
        const token = localStorage.getItem("auth_token") || "";
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            const response = await fetch(API_URL + "/add_car", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: data,
            });

            const result = await response.json();
            if (result.status === "success") {
                if (notifySubscribers) {
                    try {
                        await fetch(API_URL + "/mail/notify_new_car", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({ carid: result.carid, notify_type: "new" }),
                        });
                    } catch {
                        // Non-fatal — car was still added
                    }
                }
                notifySuccess(result.message || "Vehicle added.");
                onSuccess(result.carid);
            } else {
                notifyError(result.message || "Could not add vehicle.");
            }
        } catch (e) {
            console.error("Submission Failed: ", e);
            notifyError("Submission failed. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.drivetype) {
            notifyError("Please choose a drive type.");
            return;
        }
        if (!notifySubscribers) {
            setShowNoNotifyConfirm(true);
            return;
        }
        doSubmit();
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
                    <input list="make-options" type="text" id="make" name="make" value={formData.make} placeholder="Chevy" onChange={handleChange} required />
                    <div className="quick-picks" aria-label="Make suggestions">
                        {makeOptions.map((option) => (
                            <button key={option} type="button" className="quick-pick-btn" onClick={() => setFieldValue("make", option)}>{option}</button>
                        ))}
                    </div>
                </div>
                <div className="field-wrap">
                    <label htmlFor="model">Model</label>
                    <input list="model-options" type="text" id="model" name="model" value={formData.model} placeholder="Tahoe" onChange={handleChange} required />
                    <div className="quick-picks" aria-label="Model suggestions">
                        {modelOptions.slice(0, 4).map((option) => (
                            <button key={option} type="button" className="quick-pick-btn" onClick={() => setFieldValue("model", option)}>{option}</button>
                        ))}
                    </div>
                </div>
                <div className="field-wrap">
                    <label htmlFor="trim">Trim</label>
                    <input type="text" id="trim" name="trim" value={formData.trim} placeholder="LTZ" onChange={handleChange} required />
                </div>
                <div className="field-wrap">
                    <label htmlFor="year">Year</label>
                    <select id="year" name="year" onChange={handleChange} value={formData.year} required>
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="field-wrap">
                    <label htmlFor="miles">Miles</label>
                    <input type="number" id="miles" name="miles" placeholder="120000" onChange={handleChange} required />
                </div>
                <div className="field-wrap">
                    <label htmlFor="price">Price</label>
                    <input type="number" id="price" name="price" placeholder="24995" onChange={handleChange} required />
                </div>
                <div className="field-wrap">
                    <label htmlFor="vin">VIN</label>
                    <input type="text" id="vin" name="vin" value={formData.vin} placeholder="Vin #" onChange={handleChange} required />
                </div>
                <div className="field-wrap">
                    <label htmlFor="color">Color</label>
                    <input type="text" id="color" name="color" value={formData.color} placeholder="Black" onChange={handleChange} required />
                </div>
                <div className="field-wrap">
                    <label>Drive Type</label>
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
                <textarea id="description" name="description" placeholder="Vehicle Details" onChange={handleChange} required />
            </div>
            <label className="notify-checkbox-wrap">
                <input
                    type="checkbox"
                    checked={notifySubscribers}
                    onChange={(e) => setNotifySubscribers(e.target.checked)}
                />
                Notify email subscribers about this listing
            </label>
            <button type="submit" className="submit-btn">Next: Upload Images &rarr;</button>

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