import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo/logo.png";

export default function Navbar({ onOpenMenu }) {
  const active = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <nav className="topnav" id="topnav">
      <Link to="/" className="logo">
        <img src={logo} alt="Brotein Shake logo" />
      </Link>

      <NavLink to="/" end className={active}>Home</NavLink>
      <NavLink to="/workouts" className={active}>Workouts</NavLink>
      <NavLink to="/splits" className={active}>Splits</NavLink>
      <NavLink to="/diet" className={active}>Diet</NavLink>

      <button type="button" className="icon" aria-label="Open menu" onClick={onOpenMenu}>
        <i className="fa fa-bars" />
      </button>
    </nav>
  );
}
