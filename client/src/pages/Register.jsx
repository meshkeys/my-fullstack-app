import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    try {
      setLoading(true);
      const response = await api.post("/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      });
      login(response.data.user, response.data.token);
      navigate("/business/setup");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "15px 18px",
    border: "1.5px solid #d1dbd1",
    borderRadius: "10px",
    fontSize: "16px",
    color: "#0a1628",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          width: "440px",
          background: "#0a1628",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "44px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "#0f5c2e",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#fff", fontSize: "15px", fontWeight: "800" }}
            >
              CF
            </span>
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            CAC<span style={{ color: "#4ade80" }}>Filing</span>
          </span>
        </div>

        <div>
          <div
            style={{
              display: "inline-block",
              padding: "7px 16px",
              borderRadius: "6px",
              background: "rgba(74,222,128,0.15)",
              color: "#4ade80",
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: "22px",
            }}
          >
            Get Started Free
          </div>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "900",
              color: "#fff",
              letterSpacing: "-1.5px",
              lineHeight: "1.1",
              marginBottom: "18px",
            }}
          >
            Join thousands of
            <br />
            compliant businesses
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "#64748b",
              lineHeight: "1.65",
              marginBottom: "44px",
            }}
          >
            CAC Filing makes it easy to stay compliant. Our legal team handles
            everything — you just answer a few simple questions.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {[
              { icon: "✅", text: "Easy step-by-step filing wizard" },
              { icon: "⚡", text: "1-hour response guarantee" },
              { icon: "🔔", text: "Deadline reminders via SMS & Email" },
              { icon: "📄", text: "Expert document preparation" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "16px",
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

        <p style={{ fontSize: "14px", color: "#334155" }}>
          © 2024 CACFiling · Helping Nigerian businesses stay compliant
        </p>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          background: "#f8faf8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "460px" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "900",
              color: "#0a1628",
              letterSpacing: "-1px",
              marginBottom: "8px",
            }}
          >
            Create your account
          </h2>
          <p
            style={{ fontSize: "17px", color: "#64748b", marginBottom: "36px" }}
          >
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "#0f5c2e", fontWeight: "700", cursor: "pointer" }}
            >
              Login here
            </span>
          </p>

          {error && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                fontSize: "15px",
                color: "#dc2626",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#0a1628",
                  marginBottom: "8px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "15px",
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
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#0a1628",
                  marginBottom: "8px",
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="08012345678"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#0a1628",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#0a1628",
                  marginBottom: "8px",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading ? "#64748b" : "#0f5c2e",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "17px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
                letterSpacing: "-0.2px",
              }}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p
            style={{
              marginTop: "28px",
              fontSize: "14px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            By registering, you agree to our{" "}
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

export default Register;
