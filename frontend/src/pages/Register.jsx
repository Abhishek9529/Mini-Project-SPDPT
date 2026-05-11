import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import heroImage from "../assets/Men Vectors - Download Free High-Quality Vectors from Freepik _ Freepik.jpg";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [branch, setBranch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) return "Full name is required.";
        if (/^\d+$/.test(trimmedName)) return "Name cannot be only numbers.";
        if (trimmedName.length < 2) return "Name must be at least 2 characters.";
        if (!trimmedEmail) return "Email is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) return "Please enter a valid email address.";
        if (!password) return "Password is required.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (!/(?=.*[a-zA-Z])/.test(password)) return "Password must contain at least one letter.";
        if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number.";
        if (!/(?=.*[@$!%*?&_#-])/.test(password)) return "Password must contain at least one special character (@$!%*?&_#-).";
        if (!branch.trim()) return "Branch is required.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const res = await API.post("/students", {
                name: name.trim(),
                email: email.trim(),
                password,
                branch
            });

            setSuccess(res.data.message || "Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1800);

        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError("");

    return (
        <div className="register-shell">
            <section className="register-panel register-panel-left">
                <div className="register-content">
                    <div className="register-topbar">
                        <div className="register-brand">
                            <div className="register-brand-icon" aria-hidden="true">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <p>
                                STUDENT <span>PERSONAL DEV</span> &amp; PROGRESS TRACKER
                            </p>
                        </div>

                        <Link to="/login" className="register-login-pill">
                            Login
                        </Link>
                    </div>

                    <div className="register-copy">
                        <h1>Register</h1>
                        <p>
                            Create your account to track performance, stay organized, and grow with SPDPT.
                        </p>
                    </div>

                    <form className="register-form" onSubmit={handleSubmit}>
                        <input
                            placeholder="Type your full name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); clearError(); }}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Type your email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearError(); }}
                            required
                        />
                        <div className="register-password-wrap">
                            <input
                                type="password"
                                placeholder="Type your password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                                required
                            />
                            <p className="register-password-hint">
                                Min 6 chars, must include a letter, a number &amp; a special character (@$!%*?&amp;_#-)
                            </p>
                        </div>
                        <input
                            placeholder="Type your branch (e.g. Computer Science)"
                            value={branch}
                            onChange={(e) => { setBranch(e.target.value); clearError(); }}
                            required
                        />

                        {error && (
                            <div className="register-error" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="register-success" role="status">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                {success}
                            </div>
                        )}

                        <button type="submit" disabled={loading}>
                            {loading ? <span className="register-spinner"></span> : "Create Account"}
                        </button>
                    </form>

                    <div className="register-footer">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </div>
            </section>

            <aside className="register-panel register-panel-right">
                <div className="register-illustration-wrap">
                    <img src={heroImage} alt="Student productivity illustration" className="register-illustration" />
                </div>

                <div className="register-highlight">
                    <span className="register-highlight-line"></span>
                    <h2>Build your progress space</h2>
                    <p>
                        Set up your student profile, define goals, and start managing your academic journey in one place.
                    </p>
                </div>
            </aside>
        </div>
    );
}

export default Register;
