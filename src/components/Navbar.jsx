import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import './Navbar.css';
import Login from './Login';
import Register from './Register';

const Navbar = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

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

    return (
        <>
            <nav className="navbar">
                <div className="nav-logo">🚔 Tahoe Kings 👑</div>
                <ul className="nav-links">
                    <li><Link to="/">Inventory</Link></li>
                    <li><Link to="/AboutUs">About Us</Link></li>
                </ul>
                <button className="nav-button" onClick={handleOpenLogin}>Login</button>
            </nav>

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