import React from "react";
import { createPortal } from "react-dom";
import "./ConfirmModal.css";

export default function ConfirmModal({
    open,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) {
    if (!open) {
        return null;
    }

    return createPortal(
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal-box" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <button type="button" className="confirm-cancel-btn" onClick={onCancel}>{cancelText}</button>
                    <button type="button" className="confirm-accept-btn" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
