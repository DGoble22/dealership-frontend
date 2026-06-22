import React, { useState } from "react";
import {notifySuccess} from "../utils/notify";
import "./AuthModal.css";

export default function Register({ onClose, onSwitchToLogin }) {
    const API_URL = import.meta.env.VITE_API_URL;
    const passwordRequirements = "Use at least 8 characters with an uppercase letter, a lowercase letter, a number, and a special character.";
    const passwordChecks = [
        { label: "At least 8 characters", test: (value) => value.length >= 8 },
        { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
        { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
        { label: "One number", test: (value) => /\d/.test(value) },
        { label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) }
    ];

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        receiveEmails: false
    });
    const [formError, setFormError] = useState("");

    const getPasswordError = (password) => {
        if (!password) {
            return "";
        }

        const unmetRule = passwordChecks.find((check) => !check.test(password));
        return unmetRule ? passwordRequirements : "";
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        const passwordError = getPasswordError(formData.password);
        if (passwordError) {
            setFormError(passwordError);
            return;
        }

        try {
            const response = await fetch(API_URL + "/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.status === "success") {
                notifySuccess("Registration successful! Please login.");
                onSwitchToLogin();
            } else {
                setFormError(result.message || "Registration failed");
            }
        } catch (e) {
            console.error("Registration Failed: ", e);
            setFormError("An error occurred during registration");
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close-btn" onClick={onClose}>×</button>

                <h2 className="auth-title">Register</h2>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {formError && <p className="auth-error-text">{formError}</p>}

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
                        />
                        <div className="auth-password-checklist" aria-live="polite">
                            {passwordChecks.map((check) => {
                                const satisfied = check.test(formData.password);
                                return (
                                    <div key={check.label} className={`auth-password-check ${satisfied ? "is-valid" : "is-invalid"}`}>
                                        <span className="auth-password-check-icon">{satisfied ? "✓" : "•"}</span>
                                        <span>{check.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Re-enter your password"
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

