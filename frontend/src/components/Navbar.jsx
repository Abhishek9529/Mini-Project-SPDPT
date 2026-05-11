import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        navigate("/");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                SPDPT
            </Link>

            <button
                className="navbar-hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
                <li>
                    <NavLink to="/dashboard" onClick={closeMenu}>
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/subjects" onClick={closeMenu}>
                        Subjects
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/goals" onClick={closeMenu}>
                        Goals
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/tasks" onClick={closeMenu}>
                        Tasks
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/profile" onClick={closeMenu}>
                        Profile
                    </NavLink>
                </li>
                <li>
                    <button className="navbar-logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
