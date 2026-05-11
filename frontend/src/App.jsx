import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";
// import TaskReminder from "./components/TaskReminder";

// Route guard: redirects to /login if no token in localStorage
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Layout component that conditionally shows Navbar
function Layout({ children }) {
  const location = useLocation();

  // Don't show Navbar on Landing, Login, Register and ProfileSetup pages
  const showNavbar =
    location.pathname !== "/" &&
    location.pathname !== "/login" &&
    location.pathname !== "/register" &&
    location.pathname !== "/profile-setup" &&
    location.pathname !== "/about" &&
    location.pathname !== "/contact" &&
    location.pathname !== "/privacy" &&
    location.pathname !== "/terms";

  return (
    <div className={`app-layout ${showNavbar ? 'with-sidebar' : ''}`}>
      {showNavbar && <Navbar />}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/subjects" element={<PrivateRoute><Subjects /></PrivateRoute>} />
            <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
