import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import heroImage from "../assets/Men Vectors - Download Free High-Quality Vectors from Freepik _ Freepik.jpg";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("/auth/login", { email, password });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("student", JSON.stringify(res.data.student));

            navigate("/dashboard");

        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-shell">
            <section className="login-panel login-panel-left">
                <div className="login-content">
                    <div className="login-topbar">
                        <div className="login-brand">
                            <div className="login-brand-icon" aria-hidden="true">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <p>
                                STUDENT <span>PERSONAL DEV</span> &amp; PROGRESS TRACKER
                            </p>
                        </div>

                        <Link to="/register" className="login-register-pill">
                            Register
                        </Link>
                    </div>

                    <div className="login-copy">
                        <h1>Login</h1>
                        <p>
                            Welcome back! Please fill in your email and password to sign into your account.
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Type your email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Type your password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            required
                        />

                        {error && (
                            <div className="login-error" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="login-form-meta">
                            <span className="login-forgot">Forgot your password?</span>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? <span className="login-spinner"></span> : "Login Now"}
                        </button>
                    </form>

                    <div className="login-footer">
                        Don&apos;t have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
            </section>

            <aside className="login-panel login-panel-right">
                <div className="login-illustration-wrap">
                    <img src={heroImage} alt="Student productivity illustration" className="login-illustration" />
                </div>

                <div className="login-highlight">
                    <span className="login-highlight-line"></span>
                    <h2>Start your journey now</h2>
                    <p>
                        Track your academic performance, set goals, and achieve more with SPDPT.
                    </p>
                </div>
            </aside>
        </div>
    );
}

export default Login;
