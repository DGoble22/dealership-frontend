const EVENT_NAME = "app-toast";

export function notify(message, type = "info", duration = 2800) {
    if (!message) {
        return;
    }

    window.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { message, type, duration }
    }));
}

export function notifySuccess(message, duration) {
    notify(message, "success", duration);
}

export function notifyError(message, duration) {
    notify(message, "error", duration);
}

export function notifyInfo(message, duration) {
    notify(message, "info", duration);
}

export const TOAST_EVENT_NAME = EVENT_NAME;
