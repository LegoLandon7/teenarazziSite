import { NavLink } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import './NavBar.scss';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function closeAll() {
    setMenuOpen(false);
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className="navbar" ref={navRef}>
      <NavLink className="nav-brand" to="/">
        <img src="/favicon.png" />
        <span className="brand-text">
          <h2>teenarazzi</h2>
          <h3>.com</h3>
        </span>
      </NavLink>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" onClick={closeAll}>Home</NavLink>
        <NavLink to="/about" onClick={closeAll}>About</NavLink>
        <NavLink to="/socials" onClick={closeAll}>Socials</NavLink>
      </div>

      <div className="nav-controls">
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="toggle-icon">{theme === "dark" ? "🌙" : "☀️"}</span>
        </button>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}