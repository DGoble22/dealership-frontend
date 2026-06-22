import { useEffect } from "react";

export default function useBodyModalLock(isLocked) {
    useEffect(() => {
        document.body.classList.toggle("modal-open", Boolean(isLocked));

        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [isLocked]);
}
