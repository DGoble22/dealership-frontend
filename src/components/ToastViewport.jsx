import React, { useEffect, useState } from "react";
import { TOAST_EVENT_NAME } from "../utils/notify";
import "./ToastViewport.css";

export default function ToastViewport() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const onToast = (event) => {
            const detail = event.detail || {};
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const nextToast = {
                id,
                message: detail.message || "",
                type: detail.type || "info",
                duration: Number(detail.duration) > 0 ? Number(detail.duration) : 2800,
            };

            setToasts((current) => [...current, nextToast]);

            window.setTimeout(() => {
                setToasts((current) => current.filter((toast) => toast.id !== id));
            }, nextToast.duration);
        };

        window.addEventListener(TOAST_EVENT_NAME, onToast);
        return () => window.removeEventListener(TOAST_EVENT_NAME, onToast);
    }, []);

    return (
        <div className="toast-viewport" aria-live="polite" aria-atomic="false">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item toast-${toast.type}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
