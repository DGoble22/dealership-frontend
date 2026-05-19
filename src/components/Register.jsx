import React, { useState } from "react";
import "./AuthModal.css";

export default function Register({ onClose, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        receiveEmails: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost/dealership-project/backend/api/register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.status === "success") {
                alert("Registration successful! Please login.");
                onSwitchToLogin();
            } else {
                alert(result.message || "Registration failed");
            }
        } catch (e) {
            console.error("Registration Failed: ", e);
            alert("An error occurred during registration");
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close-btn" onClick={onClose}>×</button>

                <h2 className="auth-title">Register</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password"
                            minLength="6"
                        />
                    </div>

                    <div className="auth-field-checkbox">
                        <input
                            type="checkbox"
                            id="receiveEmails"
                            name="receiveEmails"
                            checked={formData.receiveEmails}
                            onChange={handleChange}
                        />
                        <label htmlFor="receiveEmails">Receive email notifications</label>
                    </div>

                    <button type="submit" className="auth-submit-btn">Register</button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <span className="auth-link" onClick={onSwitchToLogin}>
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
}

