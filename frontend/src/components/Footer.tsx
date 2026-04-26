import './Footer.scss';

export default function Footer() {
    return (
        <footer className="site-footer">
            <p className="footer-left"> &copy; {new Date().getFullYear()} Teenarazzi. All rights reserved.</p>

            <div className="footer-right">
                {/*<a href="/terms">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>*/}
                
                <a href="https://github.com/LegoLandon7/teenarazziSite" target="_blank" rel="noopener noreferrer">
                    Github Repo
                </a>

                <a href="/admin">Admin</a>

                <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            </div>
            </div>
        </footer>
    );
}