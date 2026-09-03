import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

const FORM_FIELDS = {
  ANNUAL_RETURNS: [
    { name: "yearEnded", label: "Year Ended", type: "date", required: true },
    {
      name: "turnover",
      label: "Annual Turnover (₦)",
      type: "number",
      required: true,
    },
    {
      name: "numberOfEmployees",
      label: "Number of Employees",
      type: "number",
      required: true,
    },
    {
      name: "natureOfBusiness",
      label: "Nature of Business",
      type: "text",
      required: true,
    },
    {
      name: "registeredAddress",
      label: "Registered Address",
      type: "textarea",
      required: true,
    },
  ],
  CHANGE_OF_DIRECTORS: [
    {
      name: "changeType",
      label: "Type of Change",
      type: "select",
      required: true,
      options: ["Add Director", "Remove Director", "Update Director Info"],
    },
    {
      name: "directorFullName",
      label: "Director's Full Name",
      type: "text",
      required: true,
    },
    {
      name: "directorEmail",
      label: "Director's Email",
      type: "email",
      required: false,
    },
    {
      name: "directorPhone",
      label: "Director's Phone Number",
      type: "tel",
      required: false,
    },
    {
      name: "directorAddress",
      label: "Director's Address",
      type: "textarea",
      required: true,
    },
    {
      name: "directorNationality",
      label: "Director's Nationality",
      type: "text",
      required: true,
    },
    {
      name: "effectiveDate",
      label: "Effective Date of Change",
      type: "date",
      required: true,
    },
  ],
  CHANGE_OF_ADDRESS: [
    {
      name: "newAddress",
      label: "New Registered Address",
      type: "textarea",
      required: true,
    },
    { name: "newState", label: "New State", type: "text", required: true },
    {
      name: "effectiveDate",
      label: "Effective Date",
      type: "date",
      required: true,
    },
  ],
  CHANGE_OF_NAME: [
    {
      name: "newName",
      label: "Proposed New Name",
      type: "text",
      required: true,
    },
    {
      name: "reasonForChange",
      label: "Reason for Name Change",
      type: "textarea",
      required: true,
    },
    {
      name: "effectiveDate",
      label: "Effective Date",
      type: "date",
      required: true,
    },
  ],
  INCREASE_SHARE_CAPITAL: [
    {
      name: "currentShareCapital",
      label: "Current Share Capital (₦)",
      type: "number",
      required: true,
    },
    {
      name: "newShareCapital",
      label: "New Share Capital (₦)",
      type: "number",
      required: true,
    },
    {
      name: "reasonForIncrease",
      label: "Reason for Increase",
      type: "textarea",
      required: true,
    },
    {
      name: "effectiveDate",
      label: "Effective Date",
      type: "date",
      required: true,
    },
  ],
  AUDITED_ACCOUNTS: [
    {
      name: "financialYearEnd",
      label: "Financial Year End Date",
      type: "date",
      required: true,
    },
    {
      name: "totalAssets",
      label: "Total Assets (₦)",
      type: "number",
      required: true,
    },
    {
      name: "totalLiabilities",
      label: "Total Liabilities (₦)",
      type: "number",
      required: true,
    },
    {
      name: "netProfit",
      label: "Net Profit/Loss (₦)",
      type: "number",
      required: true,
    },
    {
      name: "auditorName",
      label: "Auditor's Name",
      type: "text",
      required: true,
    },
  ],
};

function NewFiling() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedType = searchParams.get("type");
  const [step, setStep] = useState(1);
  const [filingTypes, setFilingTypes] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, businessRes] = await Promise.all([
          api.get("/api/filings/types"),
          api.get("/api/business"),
        ]);
        setFilingTypes(typesRes.data.filingTypes);
        setBusinesses(businessRes.data.businesses);

        if (preSelectedType) {
          const found = typesRes.data.filingTypes.find(
            (t) => t.type === preSelectedType,
          );
          if (found) {
            setSelectedType(found);
            setStep(2);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [preSelectedType]);

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (docId, file) => {
    setUploadedFiles({ ...uploadedFiles, [docId]: file });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("filingType", selectedType.type);
      submitData.append("businessId", selectedBusiness.id);
      submitData.append("formData", JSON.stringify(formData));

      // Append all uploaded files
      Object.entries(uploadedFiles).forEach(([docId, file]) => {
        if (file) submitData.append("documents", file, `${docId}_${file.name}`);
      });

      await api.post("/api/filings", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fields = selectedType ? FORM_FIELDS[selectedType.type] || [] : [];
  const requiredDocs = selectedType?.requiredDocuments || [];

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-900">
            Filing Submitted!
          </h2>
          <p className="text-gray-500 mt-2">
            Your {selectedType.label} filing has been submitted successfully.
            Our team will process it within {selectedType.estimatedTime}.
          </p>
          <div className="mt-6 p-4 bg-green-50 rounded-xl text-left">
            <p className="text-sm text-green-800 font-medium">
              What happens next?
            </p>
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              <li>✅ Filing received and logged</li>
              <li>⏳ Under review by our team</li>
              <li>📤 Submitted to CAC portal</li>
              <li>✅ Confirmation sent to you</li>
            </ul>
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
    <div className="min-h-screen bg-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-green-800 hover:text-green-600 transition flex items-center gap-1 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-800">CAC</span>
          <span className="text-xl font-semibold text-green-600">Filing</span>
        </div>
        <span className="text-sm text-gray-500">Step {step} of 4</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-900">New Filing</h1>
          <p className="mt-2 text-gray-500">
            Complete the steps below to submit your CAC filing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                step >= s ? "bg-green-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1 — Select Filing Type */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              What would you like to file?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Select the type of CAC filing you want to submit
            </p>
            <div className="space-y-3">
              {filingTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    selectedType?.type === type.type
                      ? "border-green-700 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <p
                          className={`font-semibold ${selectedType?.type === type.type ? "text-green-800" : "text-gray-800"}`}
                        >
                          {type.label}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          ⏱ {type.estimatedTime}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          📎 {type.requiredDocuments?.length} documents required
                        </p>
                      </div>
                    </div>
                    <span className="text-green-700 font-bold text-sm whitespace-nowrap">
                      {formatCurrency(type.cost)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (!selectedType)
                  return setError("Please select a filing type");
                setError("");
                setStep(2);
              }}
              className="w-full mt-6 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Select Business */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              Which business is this filing for?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Select the business you want to file for
            </p>
            <div className="space-y-3">
              {businesses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🏢</div>
                  <p className="text-gray-500 font-medium">
                    No businesses found
                  </p>
                  <button
                    onClick={() => navigate("/business/setup")}
                    className="mt-4 px-6 py-2 bg-green-800 text-white rounded-xl text-sm"
                  >
                    Add Business First
                  </button>
                </div>
              ) : (
                businesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => setSelectedBusiness(business)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition ${
                      selectedBusiness?.id === business.id
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p
                      className={`font-semibold ${selectedBusiness?.id === business.id ? "text-green-800" : "text-gray-800"}`}
                    >
                      {business.businessName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {business.businessType}
                    </p>
                    {business.rcNumber && (
                      <p className="text-xs text-green-700 mt-1">
                        RC: {business.rcNumber}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-green-800 text-green-800 font-semibold rounded-xl hover:bg-green-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!selectedBusiness)
                    return setError("Please select a business");
                  setError("");
                  setStep(3);
                }}
                className="flex-1 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Fill Form + Upload Documents */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              {selectedType?.label} Details
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Fill in the required information for{" "}
              {selectedBusiness?.businessName}
            </p>

            {/* Form Fields */}
            <div className="space-y-4 mb-8">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleFieldChange}
                      required={field.required}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none"
                    />
                  ) : field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleFieldChange}
                      required={field.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 bg-white"
                    >
                      <option value="">Select an option</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleFieldChange}
                      required={field.required}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Document Upload Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-blue-900 mb-1">
                📎 Required Documents
              </h3>
              <p className="text-xs text-blue-700 mb-4">
                Upload the following documents (PDF, JPG, PNG — max 5MB each)
              </p>
              <div className="space-y-3">
                {requiredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl p-3 border border-blue-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {doc.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {doc.required ? "🔴 Required" : "🟡 Optional"}
                        </p>
                      </div>
                      {uploadedFiles[doc.id] && (
                        <span className="text-xs text-green-600 font-medium">
                          ✅ Uploaded
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(doc.id, e.target.files[0])
                      }
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-green-800 text-green-800 font-semibold rounded-xl hover:bg-green-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  const requiredFields = fields.filter((f) => f.required);
                  const missing = requiredFields.find((f) => !formData[f.name]);
                  if (missing)
                    return setError(`Please fill in: ${missing.label}`);

                  // Check required documents
                  const missingDoc = requiredDocs.find(
                    (d) => d.required && !uploadedFiles[d.id],
                  );
                  if (missingDoc)
                    return setError(`Please upload: ${missingDoc.label}`);

                  setError("");
                  setStep(4);
                }}
                className="flex-1 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Review & Cost */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              Review & Confirm
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Review your filing details before submitting
            </p>

            {/* Filing Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4">
              <h3 className="font-bold text-gray-800 mb-4">Filing Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Filing Type</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {selectedType?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Business</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {selectedBusiness?.businessName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">RC Number</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {selectedBusiness?.rcNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Estimated Time</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {selectedType?.estimatedTime}
                  </span>
                </div>
                <hr />
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500 text-sm capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-gray-800 font-medium text-sm">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Documents Summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
              <h3 className="font-bold text-gray-800 mb-3">
                📎 Uploaded Documents
              </h3>
              <div className="space-y-2">
                {requiredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600">{doc.label}</span>
                    {uploadedFiles[doc.id] ? (
                      <span className="text-green-600 font-medium text-xs">
                        ✅ {uploadedFiles[doc.id].name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Not uploaded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-6">
              <h3 className="font-bold text-green-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(selectedType?.cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CAC Government Fee</span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(3000)}
                  </span>
                </div>
                <hr className="border-green-200" />
                <div className="flex justify-between font-bold">
                  <span className="text-green-900">Total Amount</span>
                  <span className="text-green-900 text-lg">
                    {formatCurrency((selectedType?.cost || 0) + 3000)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💳 Payment will be collected by our team after filing review
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 border border-green-800 text-green-800 font-semibold rounded-xl hover:bg-green-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Filing →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewFiling;
