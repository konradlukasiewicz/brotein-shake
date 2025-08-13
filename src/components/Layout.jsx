import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  // OPTIONAL: if you want dark mode / big font global, keep that here
  const [darkMode, setDarkMode] = useState(false);
  const [bigFont, setBigFont] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "on") setDarkMode(true);
    if (localStorage.getItem("fontSize") === "big") setBigFont(true);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("big-font", bigFont);
    localStorage.setItem("darkMode", darkMode ? "on" : "off");
    localStorage.setItem("fontSize", bigFont ? "big" : "normal");
  }, [darkMode, bigFont]);

  return (
    <>
      {/* Side menu/overlay shared on all pages */}
      <div id="myNav" className="overlay" style={{ width: menuOpen ? "100%" : "0%" }}>
        <button className="closebtn" onClick={() => setMenuOpen(false)}>&times;</button>
        <div className="overlay-content">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/workouts" onClick={() => setMenuOpen(false)}>Workouts</Link>
          <Link to="/splits" onClick={() => setMenuOpen(false)}>Splits</Link>
          <Link to="/diet" onClick={() => setMenuOpen(false)}>Diet</Link>
          <a href="mailto:konradlukasiewicz2027@u.northwestern.edu" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      </div>

      <Navbar onOpenMenu={() => setMenuOpen(true)} />

      {/* Page content renders here */}
      <Outlet />

      <footer>
        <p className="footer">© 2025 Brotein Shake. All rights reserved.</p>
      </footer>
    </>
  );
}
