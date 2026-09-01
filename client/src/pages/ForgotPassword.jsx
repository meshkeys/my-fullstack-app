import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await api.post("/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-green-900">
            Check Your Email
          </h2>
          <p className="text-gray-500 mt-2">
            If an account exists with <strong>{email}</strong>, a password reset
            link has been sent. Check your inbox and spam folder.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            The link expires in 1 hour.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-green-900">
            Forgot Password?
          </h2>
          <p className="text-gray-500 mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-700 font-medium cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
