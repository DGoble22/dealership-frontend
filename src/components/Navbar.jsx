import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';
import Login from './Login';
import Register from './Register';

const Navbar = ({ isAdmin, setIsAdmin }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [showDemoBanner, setShowDemoBanner] = useState(() => {
        if (typeof window === "undefined") return true;
        return localStorage.getItem("demo-banner-dismissed") !== "true";
    });

    const isAdminRole = (roleValue) => String(roleValue || "").trim().toLowerCase() === "admin";

    useEffect(() => {
        const refreshAuthUser = () => {
            try {
                const rawUser = localStorage.getItem("auth_user");
                setAuthUser(rawUser ? JSON.parse(rawUser) : null);
            } catch {
                setAuthUser(null);
            }
        };

        refreshAuthUser();
        window.addEventListener("auth-changed", refreshAuthUser);
        return () => window.removeEventListener("auth-changed", refreshAuthUser);
    }, []);

    const handleOpenLogin = () => {
        setShowLogin(true);
        setShowRegister(false);
    };

    const handleOpenRegister = () => {
        setShowRegister(true);
        setShowLogin(false);
    };

    const handleCloseModals = () => {
        setShowLogin(false);
        setShowRegister(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setAuthUser(null);
        setIsAdmin(false);
        window.dispatchEvent(new Event("auth-changed"));
    };

    const handleDismissDemoBanner = () => {
        setShowDemoBanner(false);
        localStorage.setItem("demo-banner-dismissed", "true");
    };

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="nav-logo">
                    <img src="/TahoeKingsFavicon.png" alt="Tahoe Kings logo" className="nav-logo-icon" />
                    <span>Tahoe Kings</span>
                </Link>
                <ul className="nav-links">
                    <li>
                        <NavLink to="/inventory" className={({ isActive }) => `nav-link-pill ${isActive ? "active" : ""}`}>
                            Inventory
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/about-us" className={({ isActive }) => `nav-link-pill ${isActive ? "active" : ""}`}>
                            About Us
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/contact" className={({ isActive }) => `nav-link-pill ${isActive ? "active" : ""}`}>
                            Contact
                        </NavLink>
                    </li>
                </ul>
                {authUser ? (
                    <div className="nav-auth-controls">
                        <div className="nav-auth-row">
                            <button className="nav-button nav-logout-button" onClick={handleLogout}>Logout ({authUser.email})</button>
                            {isAdminRole(authUser.role) && (
                                <button
                                    type="button"
                                    className={`nav-view-toggle ${isAdmin ? "is-admin" : "is-user"}`}
                                    onClick={() => setIsAdmin(!isAdmin)}
                                    aria-label={isAdmin ? "Switch to user view" : "Switch to admin view"}
                                    title={isAdmin ? "Switch to user view" : "Switch to admin view"}
                                >
                                    {isAdmin ? "A" : "U"}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <button className="nav-button" onClick={handleOpenLogin}>Login</button>
                )}
            </nav>

            {showDemoBanner && (
                <div className="demo-banner" role="status" aria-live="polite">
                    <span>Demo site only — do not enter real personal information, payments, or sensitive data.</span>
                    <button type="button" className="demo-banner-close" onClick={handleDismissDemoBanner} aria-label="Dismiss demo notice">
                        ×
                    </button>
                </div>
            )}

            {showLogin && (
                <Login
                    onClose={handleCloseModals}
                    onSwitchToRegister={handleOpenRegister}
                />
            )}

            {showRegister && (
                <Register
                    onClose={handleCloseModals}
                    onSwitchToLogin={handleOpenLogin}
                />
            )}
        </>
    );
};

export default Navbar;