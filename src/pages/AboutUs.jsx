import "./AboutUs.css";

export default function AboutUs() {
    return (
        <div className="about-page page-shell">
            <section className="about-hero">
                <p className="section-label">About Us</p>
                <h1>Small dealership values, modern buying experience.</h1>
                <p>
                    We keep the process simple, personal, and transparent. Every vehicle is presented clearly so families can shop with confidence.
                </p>
            </section>

            <section className="about-grid">
                <article>
                    <h2>What we care about</h2>
                    <p>
                        Honest descriptions, clean photos, and a sales process that respects your time. We’re here to help you find the right fit.
                    </p>
                </article>

                <article>
                    <h2>How we work</h2>
                    <p>
                        Browse online, compare vehicles, and come in when you’re ready. No pressure, no confusing steps, just a straightforward experience.
                    </p>
                </article>
            </section>
        </div>
    );
}