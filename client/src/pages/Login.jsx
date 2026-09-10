import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const response = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
      {/* Left Panel — Dark Branding */}
      <div
        style={{
          width: "420px",
          background: "#0a1628",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#0f5c2e",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#fff", fontSize: "14px", fontWeight: "800" }}
            >
              CF
            </span>
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            CAC<span style={{ color: "#4ade80" }}>Filing</span>
          </span>
        </div>

        {/* Main Content */}
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "6px",
              background: "rgba(74,222,128,0.15)",
              color: "#4ade80",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Welcome Back
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#fff",
              letterSpacing: "-1px",
              lineHeight: "1.1",
              marginBottom: "16px",
            }}
          >
            Your compliance
            <br />
            dashboard awaits
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              lineHeight: "1.65",
              marginBottom: "40px",
            }}
          >
            Log in to manage your CAC filings, track compliance deadlines, and
            communicate with your legal team.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              { icon: "📋", text: "View all your filing statuses" },
              { icon: "🔔", text: "Track compliance deadlines" },
              { icon: "💬", text: "Message your legal agent" },
              { icon: "📥", text: "Download filed documents" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "15px",
                    color: "#94a3b8",
                    fontWeight: "500",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: "13px", color: "#334155" }}>
          © 2024 CACFiling · Helping Nigerian businesses stay compliant
        </p>
      </div>

      {/* Right Panel — Form */}
      <div
        style={{
          flex: 1,
          background: "#f8faf8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#0a1628",
              letterSpacing: "-0.8px",
              marginBottom: "6px",
            }}
          >
            Login to your account
          </h2>
          <p
            style={{ fontSize: "16px", color: "#64748b", marginBottom: "32px" }}
          >
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ color: "#0f5c2e", fontWeight: "700", cursor: "pointer" }}
            >
              Register here
            </span>
          </p>

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#dc2626",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0a1628",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "1.5px solid #d1dbd1",
                  borderRadius: "10px",
                  fontSize: "15px",
                  color: "#0a1628",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0a1628",
                  }}
                >
                  Password
                </label>
                <span
                  onClick={() => navigate("/forgot-password")}
                  style={{
                    fontSize: "13px",
                    color: "#0f5c2e",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "1.5px solid #d1dbd1",
                  borderRadius: "10px",
                  fontSize: "15px",
                  color: "#0a1628",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                background: loading ? "#64748b" : "#0f5c2e",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
                letterSpacing: "-0.2px",
              }}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          <p
            style={{
              marginTop: "24px",
              fontSize: "13px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            By logging in, you agree to our{" "}
            <span
              style={{ color: "#0f5c2e", cursor: "pointer", fontWeight: "600" }}
            >
              Terms of Service
            </span>{" "}
            and{" "}
            <span
              style={{ color: "#0f5c2e", cursor: "pointer", fontWeight: "600" }}
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
