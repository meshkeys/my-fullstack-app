import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <div className="min-h-screen bg-green-50 flex flex-col md:flex-row">
      {/* Left Side — Branding */}
      <div className="hidden md:flex md:w-1/2 bg-green-800 flex-col justify-center items-center p-12 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-green-200 text-center text-lg">
          Log in to manage your CAC filings and stay compliant.
        </p>
        <div className="mt-12 space-y-6">
          {[
            { icon: "📋", text: "View your compliance dashboard" },
            { icon: "📄", text: "Track your filing status" },
            { icon: "🔔", text: "Manage your reminders" },
            { icon: "📁", text: "Download your documents" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-green-100">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="md:hidden text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">CAC Filing</h1>
          <p className="text-gray-500 mt-1">Login to your account</p>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-bold text-green-900 mb-2">Login</h2>
          <p className="text-gray-500 mb-8">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-700 font-medium cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>

            <div className="text-right">
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-green-700 cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-gray-400">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
