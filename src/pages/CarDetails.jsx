import {useEffect, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import "./CarDetails.css";
import Login from "../components/Login";
import Register from "../components/Register";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";

export default function CarDetails() {
    const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";
    const {carid} = useParams();

    const isLoggedIn = !!localStorage.getItem("auth_token");
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const [car, setCar] = useState(null);
    const [images, setImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const zoomStageRef = useRef(null);

    const [inquiry, setInquiry] = useState({ name: "", email: "", phone: "", message: "" });
    const [inquiryStatus, setInquiryStatus] = useState("idle"); // idle | sending | success | error
    const [inquiryError, setInquiryError] = useState("");

    const handleInquiryChange = (e) => setInquiry((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setInquiryStatus("sending");
        setInquiryError("");
        try {
            const subject = car ? `Inquiry about ${car.year} ${car.make} ${car.model} (VIN: ${car.vin})` : "Vehicle Inquiry";
            const res = await fetch(`${API_BASE}/mail/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...inquiry, subject }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                setInquiryStatus("success");
                setInquiry({ name: "", email: "", phone: "", message: "" });
            } else {
                setInquiryStatus("error");
                setInquiryError(data.message || "Something went wrong. Please try again.");
            }
        } catch {
            setInquiryStatus("error");
            setInquiryError("Could not reach the server. Please try again.");
        }
    };

    useEffect(() => {
        const loadCar = async () => {
            setIsLoading(true);
            setError("");
            const token = localStorage.getItem("auth_token") || "";
            const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

            try {
                const [carResponse, imagesResponse] = await Promise.all([
                    fetch(`${API_URL}/get_car_by_id?id=${carid}`, { headers: authHeaders }),
                    fetch(`${API_URL}/get_car_images?carid=${carid}`, { headers: authHeaders }),
                ]);

                const [carResult, imageResult] = await Promise.all([
                    carResponse.json(),
                    imagesResponse.json(),
                ]);

                if (carResult.status !== "success") {
                    throw new Error(carResult.message || "Could not load vehicle details");
                }

                setCar(carResult.data);

                if (imageResult.status === "success") {
                    setImages(imageResult.data || []);
                } else {
                    setImages([]);
                }
            } catch (e) {
                setError(e.message || "Could not load this vehicle right now.");
            } finally {
                setIsLoading(false);
            }
        };

        loadCar();
    }, [API_URL, carid]);

    const galleryImages = useMemo(() => {
        if (images.length > 0) return images;
        if (car?.image_path) return [{image_path: car.image_path, is_main: 1, picid: car.carid}];
        return [];
    }, [images, car]);

    const activeImage = galleryImages[activeIndex];

    const openZoom = () => {
        setZoomLevel(1);
        setIsZoomOpen(true);
    };

    const closeZoom = () => {
        setIsZoomOpen(false);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const clampZoom = (value) => Math.max(1, Math.min(3, value));

    const handleZoomWheel = (event) => {
        if (!zoomStageRef.current) {
            return;
        }

        event.preventDefault();
        const rect = zoomStageRef.current.getBoundingClientRect();
        const stageCenterX = rect.left + rect.width / 2;
        const stageCenterY = rect.top + rect.height / 2;
        const pointerX = event.clientX;
        const pointerY = event.clientY;

        const nextZoomRaw = zoomLevel * Math.exp(-event.deltaY * 0.0015);
        const nextZoom = Number(clampZoom(nextZoomRaw).toFixed(3));

        if (nextZoom === zoomLevel) {
            return;
        }

        const contentX = (pointerX - stageCenterX - panOffset.x) / zoomLevel;
        const contentY = (pointerY - stageCenterY - panOffset.y) / zoomLevel;

        setPanOffset({
            x: panOffset.x + (zoomLevel - nextZoom) * contentX,
            y: panOffset.y + (zoomLevel - nextZoom) * contentY,
        });
        setZoomLevel(nextZoom);
    };

    const nextImage = () => {
        if (galleryImages.length < 2) return;
        setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        if (galleryImages.length < 2) return;
        setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (!isZoomOpen) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeZoom();
            }

            if (event.key === "ArrowRight") {
                nextImage();
            }

            if (event.key === "ArrowLeft") {
                prevImage();
            }

        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isZoomOpen, galleryImages.length]);

    useEffect(() => {
        if (isZoomOpen) {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
        }
    }, [activeIndex, isZoomOpen]);

    useEffect(() => {
        if (zoomLevel <= 1) {
            setPanOffset({ x: 0, y: 0 });
        }
    }, [zoomLevel]);

    if (isLoading) {
        return <div className="details-loading">Loading vehicle details...</div>;
    }

    if (error || !car) {
        return (
            <div className="details-error-wrap">
                <h2>Could not load this listing</h2>
                <p>{error || "This vehicle may have been removed."}</p>
                <Link to="/inventory" className="details-back-link">Back To Inventory</Link>
            </div>
        );
    }

    return (
        <>
        <div className="car-details-page">
            <section className="details-hero">
                <div className="details-hero-top">
                    <Link to="/inventory" className="details-back-link">← Back To Inventory</Link>
                    <span className={`details-status status-${String(car.status || "").toLowerCase()}`}>
                        {car.status}
                    </span>
                </div>
                <h1>{car.year} {car.make} {car.model}</h1>
                {car.trim && <p>{car.trim}</p>}
            </section>

            <section className="details-layout">
                <div className="details-gallery-card">
                    {activeImage ? (
                        <>
                            <div className="details-main-image-wrap">
                                <button
                                    type="button"
                                    className="details-main-image-button"
                                    onClick={openZoom}
                                    aria-label="Open full-size image"
                                >
                                    <img src={activeImage.image_path} alt={`${car.year} ${car.make} ${car.model}`} className="details-main-image" />
                                    <span className="details-zoom-hint">Click image to zoom</span>
                                </button>
                                {galleryImages.length > 1 && (
                                    <>
                                        <button type="button" className="details-nav left" onClick={prevImage}>‹</button>
                                        <button type="button" className="details-nav right" onClick={nextImage}>›</button>
                                    </>
                                )}
                            </div>

                            {galleryImages.length > 1 && (
                                <div className="details-thumbs">
                                    {galleryImages.map((img, index) => (
                                        <button
                                            type="button"
                                            key={img.picid || index}
                                            className={`details-thumb ${index === activeIndex ? "active" : ""}`}
                                            onClick={() => setActiveIndex(index)}
                                        >
                                            <img src={img.image_path} alt={`Vehicle view ${index + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="details-no-image">No image available</div>
                    )}
                </div>

                <div className="details-right-col">
                <aside className="details-specs-card">
                    <div className="details-price">${Number(car.price || 0).toLocaleString()}</div>

                    <div className="details-spec-grid">
                        <div>
                            <span>Year</span>
                            <strong>{car.year}</strong>
                        </div>
                        <div>
                            <span>Miles</span>
                            <strong>{Number(car.miles || 0).toLocaleString()} mi</strong>
                        </div>
                        <div>
                            <span>Color</span>
                            <strong>{car.color || "N/A"}</strong>
                        </div>
                        <div>
                            <span>Drive Type</span>
                            <strong>{car.drivetype || "N/A"}</strong>
                        </div>
                        <div className="spec-full">
                            <span>VIN</span>
                            <strong>{car.vin}</strong>
                        </div>
                    </div>
                </aside>

                <div className="details-notify-card">
                    <p className="details-notify-eyebrow">Stay in the Loop</p>
                    <h3>Be First to See New Arrivals</h3>
                    <p>Create a free account and opt in to email notifications — we'll let you know the moment a new vehicle hits the lot.</p>
                    {!isLoggedIn && (
                        <button className="details-notify-btn" onClick={() => setShowRegister(true)}>Create an Account</button>
                    )}
                    <Link to="/inventory" className="details-notify-btn details-notify-btn--secondary">Browse Inventory</Link>
                </div>
                </div>
            </section>

            <section className="details-description-card">
                <h2>Vehicle Description</h2>
                <p>{car.description || "No description has been added for this vehicle yet."}</p>
            </section>

            <section className="details-inquiry-card">
                <h2>Inquire About This Vehicle</h2>
                <p className="details-inquiry-sub">Interested in the {car.year} {car.make} {car.model}? Send us a message and we'll get back to you shortly.</p>

                {inquiryStatus === "success" ? (
                    <div className="inquiry-success">✓ Message sent! We'll be in touch soon.</div>
                ) : (
                    <form className="inquiry-form" onSubmit={handleInquirySubmit} noValidate>
                        {inquiryStatus === "error" && (
                            <div className="inquiry-error">{inquiryError}</div>
                        )}
                        <div className="inquiry-row-2">
                            <div className="inquiry-field">
                                <label htmlFor="inq-name">Name <span aria-hidden="true">*</span></label>
                                <input id="inq-name" name="name" type="text" value={inquiry.name} onChange={handleInquiryChange} placeholder="Your name" required maxLength={120} />
                            </div>
                            <div className="inquiry-field">
                                <label htmlFor="inq-email">Email <span aria-hidden="true">*</span></label>
                                <input id="inq-email" name="email" type="email" value={inquiry.email} onChange={handleInquiryChange} placeholder="you@example.com" required maxLength={254} />
                            </div>
                        </div>
                        <div className="inquiry-field">
                            <label htmlFor="inq-phone">Phone <span className="inq-optional">(optional)</span></label>
                            <input id="inq-phone" name="phone" type="tel" value={inquiry.phone} onChange={handleInquiryChange} placeholder="(555) 000-0000" maxLength={30} />
                        </div>
                        <div className="inquiry-field">
                            <label htmlFor="inq-message">Message <span aria-hidden="true">*</span></label>
                            <textarea id="inq-message" name="message" value={inquiry.message} onChange={handleInquiryChange} placeholder={`I'm interested in this ${car.year} ${car.make} ${car.model}...`} required maxLength={4000} rows={4} />
                        </div>
                        <button type="submit" className="inquiry-submit" disabled={inquiryStatus === "sending"}>
                            {inquiryStatus === "sending" ? "Sending…" : "Send Inquiry"}
                        </button>
                    </form>
                )}
            </section>

            {isZoomOpen && activeImage && (
                <div className="details-zoom-overlay" onClick={closeZoom}>
                    <div className="details-zoom-dialog" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="details-zoom-close" aria-label="Close image zoom" onClick={closeZoom}>×</button>

                        <div className="details-zoom-stage">
                            <div
                                ref={zoomStageRef}
                                className="details-zoom-wheel-area"
                                onWheel={handleZoomWheel}
                            >
                            <img
                                src={activeImage.image_path}
                                alt={`${car.year} ${car.make} ${car.model}`}
                                className="details-zoom-image"
                                style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})` }}
                            />
                                <span className="details-zoom-scroll-hint">Scroll to zoom</span>
                            </div>

                            {galleryImages.length > 1 && (
                                <>
                                    <button type="button" className="details-nav left details-zoom-nav" onClick={prevImage}>‹</button>
                                    <button type="button" className="details-nav right details-zoom-nav" onClick={nextImage}>›</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
}
