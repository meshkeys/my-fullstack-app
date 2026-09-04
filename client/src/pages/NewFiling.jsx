import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

// Intake form sections per filing type
const INTAKE_FORMS = {
  ANNUAL_RETURNS: [
    {
      section: "Financial Information",
      icon: "💰",
      fields: [
        {
          name: "financialYearEnd",
          label: "Financial Year End Date",
          type: "date",
          required: true,
          hint: "The last day of your company's financial year",
        },
        {
          name: "turnover",
          label: "Total Annual Turnover (₦)",
          type: "number",
          required: true,
          hint: "Total revenue generated during the year",
        },
        {
          name: "isSmallCompany",
          label: "Is this a small company?",
          type: "select",
          required: true,
          options: ["Yes (turnover under ₦120m)", "No (turnover above ₦120m)"],
          hint: "Small companies file abridged accounts",
        },
        {
          name: "netAssets",
          label: "Net Assets Value (₦)",
          type: "number",
          required: true,
          hint: "Total assets minus total liabilities",
        },
        {
          name: "numberOfEmployees",
          label: "Number of Employees",
          type: "number",
          required: true,
        },
      ],
    },
    {
      section: "Company Information",
      icon: "🏢",
      fields: [
        {
          name: "natureOfBusiness",
          label: "Principal Business Activities",
          type: "textarea",
          required: true,
          hint: "Describe what your company does",
        },
        {
          name: "registeredAddress",
          label: "Current Registered Address",
          type: "textarea",
          required: true,
        },
        {
          name: "hasAddressChanged",
          label: "Has your registered address changed this year?",
          type: "select",
          required: true,
          options: ["Yes", "No"],
        },
        {
          name: "lastAGMDate",
          label: "Date of Last Annual General Meeting (AGM)",
          type: "date",
          required: true,
        },
      ],
    },
    {
      section: "Directors & Shareholders",
      icon: "👥",
      fields: [
        {
          name: "hasDirectorChanged",
          label: "Any changes to directors this year?",
          type: "select",
          required: true,
          options: ["Yes", "No"],
        },
        {
          name: "hasShareholderChanged",
          label: "Any changes to shareholders this year?",
          type: "select",
          required: true,
          options: ["Yes", "No"],
        },
        {
          name: "directorDetails",
          label: "List all current directors (name, address, nationality)",
          type: "textarea",
          required: true,
          hint: "Provide full details for each director",
        },
        {
          name: "auditorName",
          label: "Auditor's Name & Firm (if applicable)",
          type: "text",
          required: false,
        },
      ],
    },
  ],
  CHANGE_OF_DIRECTORS: [
    {
      section: "Type of Change",
      icon: "📋",
      fields: [
        {
          name: "changeType",
          label: "What type of director change is this?",
          type: "select",
          required: true,
          options: [
            "Appointment of New Director",
            "Resignation of Director",
            "Removal of Director",
            "Update Director Information",
          ],
        },
        {
          name: "effectiveDate",
          label: "Effective Date of Change",
          type: "date",
          required: true,
        },
        {
          name: "boardResolutionDate",
          label: "Date Board Resolution was Passed",
          type: "date",
          required: true,
        },
        {
          name: "reasonForChange",
          label: "Reason for Change",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      section: "Director Information",
      icon: "👤",
      fields: [
        {
          name: "directorFullName",
          label: "Director's Full Legal Name",
          type: "text",
          required: true,
        },
        {
          name: "directorDOB",
          label: "Director's Date of Birth",
          type: "date",
          required: true,
        },
        {
          name: "directorNationality",
          label: "Director's Nationality",
          type: "text",
          required: true,
        },
        {
          name: "directorOccupation",
          label: "Director's Occupation",
          type: "text",
          required: true,
        },
        {
          name: "directorAddress",
          label: "Director's Residential Address",
          type: "textarea",
          required: true,
        },
        {
          name: "directorEmail",
          label: "Director's Email Address",
          type: "email",
          required: true,
        },
        {
          name: "directorPhone",
          label: "Director's Phone Number",
          type: "tel",
          required: true,
        },
        {
          name: "directorNIN",
          label: "Director's NIN or BVN",
          type: "text",
          required: true,
          hint: "National Identification Number or Bank Verification Number",
        },
      ],
    },
  ],
  CHANGE_OF_ADDRESS: [
    {
      section: "New Address Details",
      icon: "📍",
      fields: [
        {
          name: "newAddress",
          label: "New Registered Address",
          type: "textarea",
          required: true,
          hint: "Full address including street, city",
        },
        {
          name: "newState",
          label: "State",
          type: "select",
          required: true,
          options: [
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
          ],
        },
        {
          name: "newLGA",
          label: "Local Government Area (LGA)",
          type: "text",
          required: true,
        },
        {
          name: "effectiveDate",
          label: "Effective Date of Change",
          type: "date",
          required: true,
        },
        {
          name: "isPhysicalOffice",
          label: "Type of Address",
          type: "select",
          required: true,
          options: ["Physical Office", "Virtual Office", "Home Address"],
        },
      ],
    },
    {
      section: "Authorization",
      icon: "✅",
      fields: [
        {
          name: "boardResolutionDate",
          label: "Date Board Resolution was Passed",
          type: "date",
          required: true,
        },
        {
          name: "additionalInfo",
          label: "Any additional information for the agent?",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
  CHANGE_OF_NAME: [
    {
      section: "Name Change Details",
      icon: "✏️",
      fields: [
        {
          name: "currentName",
          label: "Current Registered Name",
          type: "text",
          required: true,
        },
        {
          name: "proposedName1",
          label: "Proposed New Name (1st Choice)",
          type: "text",
          required: true,
          hint: "Your preferred new company name",
        },
        {
          name: "proposedName2",
          label: "Proposed New Name (2nd Choice)",
          type: "text",
          required: false,
          hint: "Alternative in case 1st choice is unavailable",
        },
        {
          name: "reasonForChange",
          label: "Reason for Name Change",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      section: "Authorization",
      icon: "✅",
      fields: [
        {
          name: "boardResolutionDate",
          label: "Date Board Resolution was Passed",
          type: "date",
          required: true,
        },
        {
          name: "generalMeetingDate",
          label: "Date General Meeting Approved Change",
          type: "date",
          required: true,
        },
        {
          name: "additionalInfo",
          label: "Any additional information for the agent?",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
  INCREASE_SHARE_CAPITAL: [
    {
      section: "Share Capital Details",
      icon: "💹",
      fields: [
        {
          name: "currentShareCapital",
          label: "Current Authorised Share Capital (₦)",
          type: "number",
          required: true,
        },
        {
          name: "newShareCapital",
          label: "New Authorised Share Capital (₦)",
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
          name: "boardResolutionDate",
          label: "Date Board Resolution was Passed",
          type: "date",
          required: true,
        },
        {
          name: "generalMeetingDate",
          label: "Date General Meeting Approved Increase",
          type: "date",
          required: true,
        },
        {
          name: "additionalInfo",
          label: "Any additional information for the agent?",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
  AUDITED_ACCOUNTS: [
    {
      section: "Financial Details",
      icon: "📊",
      fields: [
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
          label: "Net Profit or Loss (₦)",
          type: "number",
          required: true,
        },
        {
          name: "turnover",
          label: "Total Turnover (₦)",
          type: "number",
          required: true,
        },
      ],
    },
    {
      section: "Auditor Information",
      icon: "👨‍💼",
      fields: [
        {
          name: "auditorName",
          label: "Auditor's Full Name",
          type: "text",
          required: true,
        },
        {
          name: "auditorFirm",
          label: "Auditor's Firm Name",
          type: "text",
          required: true,
        },
        {
          name: "auditorAddress",
          label: "Auditor's Office Address",
          type: "textarea",
          required: true,
        },
        {
          name: "additionalInfo",
          label: "Any additional information for the agent?",
          type: "textarea",
          required: false,
        },
      ],
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

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/api/filings", {
        filingType: selectedType.type,
        businessId: selectedBusiness.id,
        formData,
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

  const sections = selectedType ? INTAKE_FORMS[selectedType.type] || [] : [];

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-900">
            Filing Request Submitted!
          </h2>
          <p className="text-gray-500 mt-2">
            Our legal team will review your information and prepare all
            necessary documents. You'll hear from us within 1 hour.
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
    <div className="min-h-screen bg-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-green-800 hover:text-green-600 transition flex items-center gap-1 text-sm font-medium"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-800">CAC</span>
          <span className="text-xl font-semibold text-green-600">Filing</span>
        </div>
        <span className="text-sm text-gray-500">Step {step} of 3</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-900">
            New Filing Request
          </h1>
          <p className="mt-2 text-gray-500">
            Fill in the details below — our legal team handles everything else
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
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
              Select the type of CAC filing — our team prepares all documents
              for you
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
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Documents prepared by our team
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
              Which business is this for?
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

        {/* Step 3 — Intake Form */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              {selectedType?.label} — Information Form
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              Fill in the details below. Our legal team will use this to prepare
              all required documents.
            </p>
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800">
                💡 <strong>You don't need any documents right now.</strong> Just
                fill in what you know — our agent will prepare everything and
                reach out if they need more information.
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section, sIndex) => (
                <div
                  key={sIndex}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span>{section.icon}</span>
                    {section.section}
                  </h3>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {field.hint && (
                          <p className="text-xs text-gray-400 mb-1">
                            {field.hint}
                          </p>
                        )}
                        {field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleFieldChange}
                            required={field.required}
                            rows={3}
                            placeholder={field.hint || ""}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none text-sm"
                          />
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleFieldChange}
                            required={field.required}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 bg-white text-sm"
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
                            placeholder={field.hint || ""}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="mt-6 bg-green-50 rounded-2xl p-5 border border-green-200">
              <h3 className="font-bold text-green-900 mb-3">Cost Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Service Fee (document prep + filing)
                  </span>
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
                  <span className="text-green-900">Total</span>
                  <span className="text-green-900">
                    {formatCurrency((selectedType?.cost || 0) + 3000)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💳 Payment details will be provided after agent review
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-green-800 text-green-800 font-semibold rounded-xl hover:bg-green-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  // Validate required fields
                  const allFields = sections.flatMap((s) => s.fields);
                  const requiredFields = allFields.filter((f) => f.required);
                  const missing = requiredFields.find((f) => !formData[f.name]);
                  if (missing)
                    return setError(`Please fill in: ${missing.label}`);
                  setError("");
                  handleSubmit();
                }}
                disabled={loading}
                className="flex-1 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Filing Request →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewFiling;
