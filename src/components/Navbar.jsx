import { Link, NavLink } from "react-router-dom";
import logoLg from "../assets/logo/logo.png";
import logoSm from "../assets/logo/logo_small.png";

export default function Navbar({ onOpenMenu }) {
  const active = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <nav className="topnav" id="topnav">
      <Link to="/" className="logo" aria-label="Brotein Shake home">
        <picture>
          <source srcSet={logoSm} media="(max-width: 640px)" />
          <img src={logoLg} alt="Brotein Shake logo" />
        </picture>
      </Link>

      <NavLink to="/" end className={active}>Home</NavLink>
      <NavLink to="/workouts" className={active}>Workouts</NavLink>
      <NavLink to="/splits" className={active}>Splits</NavLink>
      <NavLink to="/diet" className={active}>Diet</NavLink>

      <button className="icon" onClick={onOpenMenu} aria-label="Open menu">
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h18M3 12h18M3 18h18"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
</button>
    </nav>
  );
}
