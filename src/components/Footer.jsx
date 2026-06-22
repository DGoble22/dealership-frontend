import "./Footer.css";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer-inner page-shell">
                <p className="site-footer-brand">Tahoe Kings</p>
                <p className="site-footer-copy">Family-run car dealership focused on honest listings and a simple buying experience.</p>
                <p className="site-footer-meta">{year} Tahoe Kings · Visit us online or stop by the lot.</p>
            </div>
        </footer>
    );
}