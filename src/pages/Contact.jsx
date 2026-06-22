import { useState } from "react";
import "./Contact.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [status, setStatus] = useState("idle"); // idle | sending | success | error
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("sending");
        setErrorMsg("");
        try {
            const res = await fetch(`${API}/mail/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, subject: `Inquiry from ${form.name}` }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                setStatus("success");
                setForm({ name: "", email: "", phone: "", message: "" });
            } else {
                setStatus("error");
                setErrorMsg(data.message || "Something went wrong. Please try again.");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Could not reach the server. Please try again.");
        }
    };

    return (
        <div className="contact-page page-shell">
            <section className="contact-hero">
                <p className="section-label">Contact Us</p>
                <h1>We'd love to hear from you.</h1>
                <p>Have a question about a vehicle or want to schedule a visit? Send us a message and we'll get back to you shortly.</p>
            </section>

            <section className="contact-body">
                <div className="contact-info">
                    <h2>Get in touch</h2>
                    <p>Feel free to reach out through the form or directly via email. We typically respond within one business day.</p>
                    <ul className="contact-details">
                        <li>
                            <span className="contact-icon">✉</span>
                            <a href="mailto:contact@tahoekings.com">contact@tahoekings.com</a>
                        </li>
                        <li>
                            <span className="contact-icon">📍</span>
                            <span>South Lake Tahoe, CA</span>
                        </li>
                    </ul>
                </div>

                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    {status === "success" && (
                        <div className="contact-success">
                            ✓ Message sent! We'll be in touch soon.
                        </div>
                    )}
                    {status === "error" && (
                        <div className="contact-error">{errorMsg}</div>
                    )}

                    <div className="form-row">
                        <label htmlFor="contact-name">Name <span aria-hidden="true">*</span></label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                            maxLength={120}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="contact-email">Email <span aria-hidden="true">*</span></label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            maxLength={254}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="contact-phone">Phone <span className="optional">(optional)</span></label>
                        <input
                            id="contact-phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="(555) 000-0000"
                            maxLength={30}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="contact-message">Message <span aria-hidden="true">*</span></label>
                        <textarea
                            id="contact-message"
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Tell us what you're looking for..."
                            required
                            maxLength={4000}
                            rows={6}
                        />
                    </div>

                    <button type="submit" className="contact-submit" disabled={status === "sending"}>
                        {status === "sending" ? "Sending…" : "Send Message"}
                    </button>
                </form>
            </section>
        </div>
    );
}
