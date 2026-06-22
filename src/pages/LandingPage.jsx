import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [featuredCars, setFeaturedCars] = useState([]);

    useEffect(() => {
        const fetchFeaturedCars = async () => {
            try {
                const response = await fetch(API_URL + "/get_cars");
                const result = await response.json();

                if (result.status === "success") {
                    const recentCars = [...(result.data || [])]
                        .sort((leftCar, rightCar) => Number(rightCar.carid || 0) - Number(leftCar.carid || 0))
                        .slice(0, 5);
                    setFeaturedCars(recentCars);
                }
            } catch (error) {
                console.error("Could not load featured cars:", error);
            }
        };

        fetchFeaturedCars();
    }, [API_URL]);

const testimonials = [
    {
        quote: "The team made the whole process so easy and we found our dream truck!",
        name: "Michael R.",
        role: "Local customer"
    },
    {
        quote: "Their honesty about each vehicle was refreshing and made my decision-making straightforward.",
        name: "Samantha K.",
        role: "Repeat buyer"
    },
    {
        quote: "Despite being a smaller dealership, they had an impressive selection that I really enjoyed browsing online!",
        name: "Jordan P.",
        role: "First-time buyer"
    }
];

    return (
        <div className="landing-page">
            <section className="hero-section reveal-block">
                <div className="hero-copy">
                    <p className="eyebrow">Family-run dealership with a modern online experience</p>
                    <h1>Find the right vehicle without the pressure.</h1>
                    <p className="hero-text">
                        Tahoe Kings keeps the process simple: browse fresh inventory, compare featured cars, and visit us when you’re ready.
                    </p>

                    <div className="hero-actions">
                        <Link to="/inventory" className="hero-button primary">View Inventory</Link>
                        <Link to="/about-us" className="hero-button secondary">About Us</Link>
                    </div>
                </div>

                <div className="hero-image-card">
                    <div className="hero-image-frame">
                        <img
                            src="/DD830897-CEED-4247-9007-9F575D81591F_1_105_c.jpeg"
                            alt="Modern dealership vehicle"
                        />
                    </div>
                </div>
            </section>

            <section className="info-band reveal-block">
                <div className="info-panel accent-panel">
                    <p className="section-label">Welcome</p>
                    <h2>About Tahoe Kings</h2>
                    <p>
                        We’re a small family-run dealership focused on clean vehicles, honest descriptions, and a buying experience that feels helpful instead of rushed.
                    </p>
                </div>

                <div className="info-panel stat-panel">
                    <div>
                        <strong>{featuredCars.length || "--"}</strong>
                        <span>Featured vehicles loaded</span>
                    </div>
                    <div>
                        <strong>Fresh</strong>
                        <span>Recent arrivals up top</span>
                    </div>
                    <div>
                        <strong>Local</strong>
                        <span>Family-run and community focused</span>
                    </div>
                </div>
            </section>

            <section className="section-card featured-section reveal-block">
                <div className="section-heading">
                    <div>
                        <p className="section-label">Featured Cars</p>
                        <h2>Most recent arrivals</h2>
                    </div>
                    <Link to="/inventory" className="section-link">Browse all inventory</Link>
                </div>
                <div className="featured-bar">
                    {featuredCars.length > 0 ? featuredCars.map((car) => (
                        <Link key={car.carid} to={`/cars/${car.carid}`} className="featured-car-link">
                        <article className="featured-car-card" style={{ "--card-delay": `${featuredCars.indexOf(car) * 60}ms` }}>
                            <div className="featured-car-image">
                                <img src={car.image_path} alt={`${car.year} ${car.make} ${car.model}`} />
                            </div>
                            <div className="featured-car-copy">
                                <span>{car.year} {car.make}</span>
                                <strong>{car.model}</strong>
                                <p>${Number(car.price || 0).toLocaleString()}</p>
                            </div>
                        </article>
                        </Link>
                    )) : Array.from({ length: 3 }).map((_, index) => (
                        <article key={index} className="featured-car-card placeholder">
                            <div className="featured-car-image placeholder-box" />
                            <div className="featured-car-copy">
                                <span>Featured vehicle</span>
                                <strong>More cars coming soon</strong>
                                <p>Check back for the latest arrivals.</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section-card testimonials-section reveal-block">
                <div className="section-heading">
                    <div>
                        <p className="section-label">Testimonials</p>
                        <h2>What customers are saying</h2>
                    </div>
                </div>

                <div className="testimonial-grid">
                    {testimonials.map((testimonial, index) => (
                        <blockquote key={testimonial.name} className="testimonial-card" style={{ "--card-delay": `${index * 80}ms` }}>
                            <p>“{testimonial.quote}”</p>
                            <footer>
                                <strong>{testimonial.name}</strong>
                                <span>{testimonial.role}</span>
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </section>
        </div>
    );
}

