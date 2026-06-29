import {HashRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

//Page Imports
import LandingPage from "./pages/LandingPage.jsx";
import Inventory from "./pages/Inventory.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import CarDetails from "./pages/CarDetails.jsx";
import Contact from "./pages/Contact.jsx";
import Unsubscribe from "./pages/Unsubscribe.jsx";
import Footer from "./components/Footer.jsx";
import ToastViewport from "./components/ToastViewport.jsx";
import {useEffect, useState} from "react";

//Main dealership function
function App() {
    const [isAdmin, setIsAdmin] = useState(false);

    const isAdminRole = (roleValue) => String(roleValue || "").trim().toLowerCase() === "admin";

    useEffect(() => {
        const syncAdminMode = () => {
            try {
                const rawUser = localStorage.getItem("auth_user");
                const user = rawUser ? JSON.parse(rawUser) : null;
                setIsAdmin(isAdminRole(user?.role));
            } catch {
                setIsAdmin(false);
            }
        };

        syncAdminMode();
        window.addEventListener("auth-changed", syncAdminMode);
        return () => window.removeEventListener("auth-changed", syncAdminMode);
    }, []);

    return (
        <HashRouter>
            <div className="App">
                <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/inventory" element={<Inventory isAdmin={isAdmin} />} />
                        <Route path="/about-us" element={<AboutUs/>} />
                        <Route path="/AboutUs" element={<AboutUs/>} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/cars/:carid" element={<CarDetails />} />
                        <Route path="/unsubscribe" element={<Unsubscribe />} />
                    </Routes>
                </main>
                <Footer />
                <ToastViewport />
            </div>
        </HashRouter>
    );
}

export default App;
