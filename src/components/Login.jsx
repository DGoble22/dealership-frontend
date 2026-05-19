import React, { useState } from "react";
import "./AuthModal.css";

export default function Login({ onClose, onSwitchToRegister }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost/dealership-project/backend/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.status === "success") {
                alert("Login successful!");
                onClose();
                // TODO: Store session/token
            } else {
                alert(result.message || "Login failed");
            }
        } catch (e) {
            console.error("Login Failed: ", e);
            alert("An error occurred during login");
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close-btn" onClick={onClose}>×</button>

                <h2 className="auth-title">Login</h2>

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
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn">Login</button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <span className="auth-link" onClick={onSwitchToRegister}>
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
}

