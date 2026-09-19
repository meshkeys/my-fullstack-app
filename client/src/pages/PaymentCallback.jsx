import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [error, setError] = useState("");
  const [filingId, setFilingId] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus("failed");
        setError("No payment reference found.");
        return;
      }
      try {
        const { data } = await api.get(
          `/api/filings/verify-payment/${reference}`,
        );
        setFilingId(data.filing?.id || null);
        if (data.status === "success") {
          setStatus("success");
        } else {
          setStatus("failed");
          setError("Payment was not completed.");
        }
      } catch (err) {
        setStatus("failed");
        setError(err.response?.data?.message || "Could not verify payment.");
      }
    };
    verify();
  }, [reference]);

  const handleRetry = async () => {
    if (!filingId) return;
    setRetrying(true);
    setError("");
    try {
      const { data } = await api.post(`/api/filings/${filingId}/pay`);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Could not restart payment.");
      setRetrying(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-green-800 font-medium">
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-900">
            Payment Successful!
          </h2>
          <p className="text-gray-500 mt-2">
            Your filing request has been submitted. Our legal team will
            review your information and prepare all necessary documents.
            You'll hear from us within 1 hour.
          </p>
          <div className="mt-6 p-4 bg-green-50 rounded-xl text-left space-y-2">
            <p className="text-sm text-green-800 font-medium">
              What happens next?
            </p>
            <p className="text-sm text-green-700">
              📥 Our agent reviews your submission
            </p>
            <p className="text-sm text-green-700">
              📄 Agent prepares all required documents
            </p>
            <p className="text-sm text-green-700">
              📧 Agent contacts you if more info is needed
            </p>
            <p className="text-sm text-green-700">
              📤 Agent submits to CAC on your behalf
            </p>
            <p className="text-sm text-green-700">
              ✅ You receive confirmation when done
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-700">
          Payment Not Completed
        </h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <p className="text-sm text-gray-400 mt-2">
          Don't worry — your filing details and documents are saved. You can
          retry payment below.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {filingId && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
            >
              {retrying ? "Redirecting..." : "Retry Payment"}
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 border border-green-800 text-green-800 font-semibold rounded-xl hover:bg-green-50 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCallback;
