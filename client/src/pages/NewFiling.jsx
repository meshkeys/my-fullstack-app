/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

// Format number with commas
const formatNumber = (value) => {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const unformatNumber = (value) => {
  if (!value) return "";
  return value.toString().replace(/,/g, "");
};

const INTAKE_FORMS = {
  ANNUAL_RETURNS: [
    {
      section: "Company Type",
      icon: "🏢",
      fields: [
        {
          name: "isSmallCompany",
          label: "Is this a small company?",
          type: "select",
          required: true,
          options: [
            "Yes — turnover under ₦120m and net assets under ₦60m",
            "No — above the small company threshold",
          ],
          hint: "Small companies under CAMA 2020 are exempt from holding AGMs",
        },
        {
          name: "businessNameType",
          label: "Is this a Business Name (sole proprietor/partnership)?",
          type: "select",
          required: true,
          options: ["Yes — Business Name", "No — Limited Company or other"],
          hint: "Business names file by 30th June annually without AGM requirement",
        },
      ],
    },
    {
      section: "Financial Information",
      icon: "💰",
      fields: [
        {
          name: "financialYearEnd",
          label: "Financial Year End Date",
          type: "date",
          required: true,
          hint: "The last day of your company's financial year e.g 31st December 2024",
        },
        {
          name: "turnover",
          label: "Total Annual Turnover (₦)",
          type: "number_formatted",
          required: true,
          hint: "Total revenue generated during the year e.g 5,000,000",
        },
        {
          name: "netAssets",
          label: "Net Assets Value (₦)",
          type: "number_formatted",
          required: true,
          hint: "Total assets minus total liabilities",
        },
        {
          name: "numberOfEmployees",
          label: "Number of Employees",
          type: "number",
          required: true,
          hint: "Total number of staff including part-time",
        },
      ],
    },
    {
      section: "Company Information",
      icon: "📋",
      fields: [
        {
          name: "natureOfBusiness",
          label: "Principal Business Activities",
          type: "textarea",
          required: true,
          hint: "Describe what your company does e.g Trading in general merchandise",
        },
        {
          name: "registeredAddress",
          label: "Current Registered Address",
          type: "textarea",
          required: true,
          hint: "Your official address as registered with CAC",
        },
        {
          name: "hasAddressChanged",
          label: "Has your registered address changed since last filing?",
          type: "select",
          required: true,
          options: ["No", "Yes"],
        },
        {
          name: "newAddress",
          label: "New Registered Address",
          type: "textarea",
          required: false,
          hint: "Only fill if address has changed",
          showIf: { field: "hasAddressChanged", value: "Yes" },
        },
        {
          name: "lastAGMDate",
          label: "Date of Last Annual General Meeting (AGM)",
          type: "date",
          required: false,
          hint: "Leave blank if you are a small company or business name — AGM not required",
          showIfNot: {
            field: "isSmallCompany",
            value: "Yes — turnover under ₦120m and net assets under ₦60m",
          },
        },
      ],
    },
    {
      section: "Directors Information",
      icon: "👥",
      fields: [
        {
          name: "hasDirectorChanged",
          label: "Any changes to directors since last filing?",
          type: "select",
          required: true,
          options: ["No", "Yes"],
        },
        {
          name: "director1Name",
          label: "Director 1 — Full Name",
          type: "text",
          required: true,
          hint: "Full legal name as on ID",
        },
        {
          name: "director1Address",
          label: "Director 1 — Residential Address",
          type: "textarea",
          required: true,
        },
        {
          name: "director1Nationality",
          label: "Director 1 — Nationality",
          type: "text",
          required: true,
        },
        {
          name: "director2Name",
          label: "Director 2 — Full Name (if applicable)",
          type: "text",
          required: false,
        },
        {
          name: "director2Address",
          label: "Director 2 — Residential Address",
          type: "textarea",
          required: false,
        },
        {
          name: "director2Nationality",
          label: "Director 2 — Nationality",
          type: "text",
          required: false,
        },
        {
          name: "director3Name",
          label: "Director 3 — Full Name (if applicable)",
          type: "text",
          required: false,
        },
        {
          name: "director3Address",
          label: "Director 3 — Residential Address",
          type: "textarea",
          required: false,
        },
        {
          name: "director3Nationality",
          label: "Director 3 — Nationality",
          type: "text",
          required: false,
        },
        {
          name: "hasShareholderChanged",
          label: "Any changes to shareholders since last filing?",
          type: "select",
          required: true,
          options: ["No", "Yes"],
        },
        {
          name: "auditorName",
          label: "Auditor's Name & Firm",
          type: "text",
          required: false,
          hint: "Leave blank if you are a small company — auditor not mandatory",
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
          hint: "The date directors met and approved this change",
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
      section: "Director Details",
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
      section: "Address Change Details",
      icon: "📍",
      fields: [
        {
          name: "currentAddress",
          label: "Current Registered Address",
          type: "textarea",
          required: true,
          hint: "Your current address as registered with CAC",
        },
        {
          name: "newAddress",
          label: "New Registered Address",
          type: "textarea",
          required: true,
          hint: "Full new address including street name and number",
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
          name: "addressType",
          label: "Type of New Address",
          type: "select",
          required: true,
          options: ["Physical Office", "Virtual Office", "Home Address"],
        },
        {
          name: "effectiveDate",
          label: "Effective Date of Change",
          type: "date",
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
          hint: "Board must approve change of address",
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
          label: "Proposed New Name — 1st Choice",
          type: "text",
          required: true,
          hint: "Your preferred new company name",
        },
        {
          name: "proposedName2",
          label: "Proposed New Name — 2nd Choice",
          type: "text",
          required: false,
          hint: "Alternative name in case 1st choice is unavailable",
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
          hint: "Shareholders must approve name change at a general meeting",
        },
        {
          name: "additionalInfo",
          label: "Any additional information?",
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
          type: "number_formatted",
          required: true,
          hint: "e.g 10,000,000",
        },
        {
          name: "newShareCapital",
          label: "New Authorised Share Capital (₦)",
          type: "number_formatted",
          required: true,
          hint: "Must be higher than current share capital",
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
          label: "Any additional information?",
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
          type: "number_formatted",
          required: true,
          hint: "e.g 25,000,000",
        },
        {
          name: "totalLiabilities",
          label: "Total Liabilities (₦)",
          type: "number_formatted",
          required: true,
        },
        {
          name: "netProfit",
          label: "Net Profit or Loss (₦)",
          type: "number_formatted",
          required: true,
          hint: "Use negative number for a loss e.g -500,000",
        },
        {
          name: "turnover",
          label: "Total Turnover (₦)",
          type: "number_formatted",
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
          label: "Any additional information?",
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
    const { name, value, type } = e.target;
    if (type === "number" || e.target.dataset.formatted) {
      const raw = unformatNumber(value);
      setFormData({ ...formData, [name]: raw });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNumberInput = (name, value) => {
    const raw = unformatNumber(value);
    if (raw === "" || /^\d*$/.test(raw)) {
      setFormData({ ...formData, [name]: raw });
    }
  };

  // Check if field should be shown based on conditions
  const shouldShowField = (field) => {
    if (field.showIf) {
      return formData[field.showIf.field] === field.showIf.value;
    }
    if (field.showIfNot) {
      return formData[field.showIfNot.field] !== field.showIfNot.value;
    }
    return true;
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

  // Render a single field
  const renderField = (field) => {
    if (!shouldShowField(field)) return null;

    if (field.type === "number_formatted") {
      return (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.hint && (
            <p className="text-xs text-gray-400 mb-1">{field.hint}</p>
          )}
          <input
            type="text"
            name={field.name}
            value={formatNumber(formData[field.name] || "")}
            onChange={(e) => handleNumberInput(field.name, e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 text-sm"
          />
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.hint && (
            <p className="text-xs text-gray-400 mb-1">{field.hint}</p>
          )}
          <textarea
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleFieldChange}
            required={field.required}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none text-sm"
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.hint && (
            <p className="text-xs text-gray-400 mb-1">{field.hint}</p>
          )}
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
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.hint && (
          <p className="text-xs text-gray-400 mb-1">{field.hint}</p>
        )}
        <input
          type={field.type}
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleFieldChange}
          required={field.required}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 text-sm"
        />
      </div>
    );
  };

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
              Select the type — our team prepares all documents for you
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
              Fill in what you know. Our legal team prepares all required
              documents.
            </p>
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800">
                💡 <strong>You don't need any documents right now.</strong> Just
                fill in the details — our agent will prepare everything and
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
                    {section.fields.map((field) => renderField(field))}
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
                  const allFields = sections.flatMap((s) => s.fields);
                  const requiredFields = allFields.filter(
                    (f) => f.required && shouldShowField(f),
                  );
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
