import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const Unsubscribe = () => {
    const API = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            setMessage("No unsubscribe token found in this link.");
            return;
        }

        fetch(`${API}/mail/unsubscribe?token=${encodeURIComponent(token)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    setStatus("success");
                    setMessage(data.message || "You've been unsubscribed.");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Something went wrong.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Could not reach the server. Please try again later.");
            });
    }, []);

    return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            fontFamily: "sans-serif",
            textAlign: "center",
        }}>
            {status === "loading" && (
                <p style={{ color: "#555" }}>Processing your request…</p>
            )}

            {status === "success" && (
                <>
                    <h2 style={{ color: "#163a63", marginBottom: "12px" }}>Unsubscribed</h2>
                    <p style={{ color: "#555", maxWidth: "400px" }}>{message}</p>
                    <p style={{ color: "#888", fontSize: "0.88rem", marginTop: "8px" }}>
                        You won't receive new listing emails from Tahoe Kings anymore.
                    </p>
                    <Link to="/" style={{
                        marginTop: "24px",
                        display: "inline-block",
                        background: "#163a63",
                        color: "white",
                        padding: "10px 24px",
                        borderRadius: "999px",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}>Back to Home</Link>
                </>
            )}

            {status === "error" && (
                <>
                    <h2 style={{ color: "#c0392b", marginBottom: "12px" }}>Invalid Link</h2>
                    <p style={{ color: "#555", maxWidth: "400px" }}>{message}</p>
                    <Link to="/" style={{
                        marginTop: "24px",
                        display: "inline-block",
                        background: "#163a63",
                        color: "white",
                        padding: "10px 24px",
                        borderRadius: "999px",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}>Back to Home</Link>
                </>
            )}
        </div>
    );
};

export default Unsubscribe;
