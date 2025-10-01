import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fakeLogin, getStoredAuth } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // if already logged in, go to dashboard
        const { token } = getStoredAuth();
        if (token) navigate("/dashboard", { replace: true });
    }, [navigate]);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!mobile || !password) {
            setError("Please enter mobile number and password.");
            return;
        }
        setLoading(true);
        try {
            const res = await fakeLogin({ mobile, password });
            setLoading(false);
            if (res.success) {
                navigate("/dashboard", { replace: true });
            } else {
                setError(res.message || "Login failed");
            }
        } catch (err) {
            setLoading(false);
            setError("An error occurred. Try again.");
            console.error(err);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-75">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h3 className="card-title mb-2">Trainer Sign In</h3>
                            <p className="text-muted small">Login with your mobile and password</p>

                            {error && (
                                <div className="alert alert-danger py-2" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={submit}>
                                <div className="mb-3">
                                    <label className="form-label">Mobile</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="e.g. 9999999999"
                                        required
                                        inputMode="numeric"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                <div className="d-grid">
                                    <button className="btn btn-success" type="submit" disabled={loading}>
                                        {loading ? "Signing in..." : "Sign In"}
                                    </button>
                                </div>
                            </form>

                            <hr />
                            <div className="text-center small text-muted">
                                Demo credentials: <strong>9999999999 / 123456</strong>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-3 small text-muted">
                        Built for Garbh Sarthi trainers — simple and focused.
                    </div>
                </div>
            </div>
        </div>
    );
}
