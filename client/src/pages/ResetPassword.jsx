import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await api.post("/api/auth/reset-password", {
        token,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-700">Invalid Link</h2>
          <p className="text-gray-500 mt-2">
            This reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-6 w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900">Password Reset!</h2>
          <p className="text-gray-500 mt-2">
            Your password has been reset successfully. You can now login with
            your new password.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Login Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold text-green-900">Reset Password</h2>
          <p className="text-gray-500 mt-2">Enter your new password below</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your new password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
