import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
      <div className="app-root">
        <header className="app-header">
          <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div className="container">
              <Link to="/" className="navbar-brand fw-bold">
                Garbh Sarthi (Trainer Panel)
              </Link>
              <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navMenu"
                  aria-controls="navMenu"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>

              <div className="collapse navbar-collapse" id="navMenu">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link to="/" className="nav-link">Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <main className="py-4">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
                path="/dashboard/*"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
            />
            <Route path="*" element={<div className="container">Page not found</div>} />
          </Routes>
        </main>

        <footer className="text-center py-3 text-muted small">
          &copy; {new Date().getFullYear()} Garbh Sarthi — Trainer Panel
        </footer>
      </div>
  );
}

export default App;
