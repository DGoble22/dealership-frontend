import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

//Page Imports
import Inventory from "./pages/Inventory.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import {useState} from "react";

//Main dealership function
function App() {
    const [isAdmin, setIsAdmin] = useState(true);

    return (
        <BrowserRouter>
            <div className="App">
                <Navbar />
                <button onClick={() => setIsAdmin(!isAdmin)} style={{margin: '10px'}}>
                    Switch to {isAdmin ? "User View" : "Admin View"}
                </button>
                <main style={{ padding: '20px' }}>
                    <Routes>
                        <Route path="/" element={<Inventory isAdmin={isAdmin} />} />
                        <Route path="/AboutUs" element={<AboutUs/>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
