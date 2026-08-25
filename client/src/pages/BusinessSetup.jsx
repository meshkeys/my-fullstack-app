import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//import { useAuth } from "../context/AuthContext";

const BUSINESS_TYPES = [
  {
    value: "BUSINESS_NAME",
    label: "Business Name",
    desc: "Sole proprietor or partnership",
  },
  {
    value: "PRIVATE_LIMITED_COMPANY",
    label: "Private Limited Company (LTD)",
    desc: "Most common company type",
  },
  {
    value: "PUBLIC_LIMITED_COMPANY",
    label: "Public Limited Company (PLC)",
    desc: "Publicly traded companies",
  },
  {
    value: "INCORPORATED_TRUSTEE",
    label: "Incorporated Trustee",
    desc: "NGOs, churches, associations",
  },
  {
    value: "LIMITED_LIABILITY_PARTNERSHIP",
    label: "Limited Liability Partnership (LLP)",
    desc: "Professional partnerships",
  },
];

const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function BusinessSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    rcNumber: "",
    registrationDate: "",
    address: "",
    state: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBusinessTypeSelect = (type) => {
    setFormData({ ...formData, businessType: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.businessName || !formData.businessType) {
      return setError("Please fill all required fields");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // get directly from localStorage
      console.log("Token:", token); // debug line
      setError("");
      await axios.post("http://localhost:5000/api/business", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div className="min-h-screen bg-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-800">CAC</span>
          <span className="text-xl font-semibold text-green-600">Filing</span>
        </div>
        <span className="text-sm text-gray-500">Step {step} of 2</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-900">
            Set Up Your Business Profile
          </h1>
          <p className="mt-2 text-gray-500">
            Tell us about your business so we can personalize your compliance
            dashboard
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-green-700" : "bg-gray-200"}`}
          />
          <div
            className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-green-700" : "bg-gray-200"}`}
          />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1 — Business Type */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              What type of business do you have?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Select the option that matches your CAC registration type
            </p>
            <div className="space-y-3">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleBusinessTypeSelect(type.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    formData.businessType === type.value
                      ? "border-green-700 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-300"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      formData.businessType === type.value
                        ? "text-green-800"
                        : "text-gray-800"
                    }`}
                  >
                    {type.label}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!formData.businessType)
                  return setError("Please select a business type");
                setError("");
                setStep(2);
              }}
              className="w-full mt-6 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Business Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-green-900 mb-2">
              Tell us about your business
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Fill in your business details as registered with CAC
            </p>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Test Company Limited"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>

            {/* RC Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RC Number
                <span className="text-gray-400 font-normal ml-1">
                  (optional if not yet registered)
                </span>
              </label>
              <input
                type="text"
                name="rcNumber"
                value={formData.rcNumber}
                onChange={handleChange}
                placeholder="e.g. RC1234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>

            {/* Registration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAC Registration Date
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State of Operation
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 bg-white"
              >
                <option value="">Select a state</option>
                {NIGERIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Lagos Street, Victoria Island"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-green-800 text-green-800 font-semibold rounded-xl hover:bg-green-50 transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save & Continue →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default BusinessSetup;
