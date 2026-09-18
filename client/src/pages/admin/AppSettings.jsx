import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FILING_LABELS = {
  ANNUAL_RETURNS: "Annual Returns",
  CHANGE_OF_DIRECTORS: "Change of Directors",
  CHANGE_OF_ADDRESS: "Change of Address",
  CHANGE_OF_NAME: "Change of Name",
  INCREASE_SHARE_CAPITAL: "Increase Share Capital",
  AUDITED_ACCOUNTS: "Audited Accounts",
};

const FILING_ICONS = {
  ANNUAL_RETURNS: "📝",
  CHANGE_OF_DIRECTORS: "👥",
  CHANGE_OF_ADDRESS: "📍",
  CHANGE_OF_NAME: "✏️",
  INCREASE_SHARE_CAPITAL: "💰",
  AUDITED_ACCOUNTS: "📊",
};

const FREQUENCY_OPTIONS = [
  { value: "immediate", label: "Immediately (as they come in)" },
  { value: "hourly", label: "Every Hour" },
  { value: "every_6_hours", label: "Every 6 Hours" },
  { value: "twice_daily", label: "Twice Daily (9am & 3pm)" },
  { value: "daily_morning", label: "Daily at 9:00 AM" },
  { value: "daily_evening", label: "Daily at 5:00 PM" },
];

function AppSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [slaConfigs, setSlaConfigs] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSLA, setEditingSLA] = useState(null);
  const [editingSLAValues, setEditingSLAValues] = useState({});
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingPriceValues, setEditingPriceValues] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const [settingsRes, slaRes, pricesRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/settings`, { headers }),
        axios.get(`${baseUrl}/api/admin/sla`, { headers }),
        axios.get(`${baseUrl}/api/admin/prices`, { headers }),
      ]);
      setSettings(settingsRes.data.settings);
      setSlaConfigs(slaRes.data.configs);
      setPrices(pricesRes.data.prices);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, []);

  const getSetting = (key) => settings.find((s) => s.key === key)?.value;

  const handleSaveSetting = async (key, value) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/settings/${key}`,
        { value },
        { headers },
      );
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s)),
      );
      setSuccessMsg("Setting updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  };

  const handleSaveSLA = async (filingType) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/sla/${filingType}`,
        editingSLAValues,
        { headers },
      );
      setSuccessMsg("SLA updated successfully!");
      setEditingSLA(null);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating SLA:", error);
    }
  };

  const handleSavePrice = async (filingType) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/prices/${filingType}`,
        editingPriceValues,
        { headers },
      );
      setSuccessMsg("Price updated successfully!");
      setEditingPrice(null);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const autoAssignEnabled = getSetting("auto_assign_enabled") === "true";
  const autoAssignMethod = getSetting("auto_assign_method") || "round_robin";
  const maxFilings = getSetting("max_filings_per_agent") || "20";
  const responseTime = getSetting("response_time_display") || "1 hour";
  const assignFrequency = getSetting("assign_frequency") || "immediate";

  const inputStyle = {
    padding: "9px 12px",
    border: "1.5px solid #d1dbd1",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0a1628",
    background: "#fff",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f4",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#0a1628",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate("/admin/dashboard")}
          style={{
            color: "#94a3b8",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Dashboard
        </button>
        <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
          CAC<span style={{ color: "#4ade80" }}>Filing</span> · App Settings
        </span>
        <div />
      </nav>

      <div
        style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 20px" }}
      >
        {successMsg && (
          <div
            style={{
              marginBottom: "16px",
              padding: "14px 18px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "10px",
              fontSize: "15px",
              color: "#15803d",
              fontWeight: "500",
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* Section 1 — App Settings */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e8ede8",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid #f1f5f1",
              background: "#f8faf8",
            }}
          >
            <h2
              style={{ fontSize: "17px", fontWeight: "800", color: "#0a1628" }}
            >
              ⚙️ General Settings
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              Control how the app behaves and what customers see
            </p>
          </div>

          <div
            style={{
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            {/* Response Time */}
            <div
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #f8faf8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#0a1628",
                  }}
                >
                  Response Time Display
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Shown to customers on the website e.g "1 hour"
                </p>
              </div>
              <input
                defaultValue={responseTime}
                onBlur={(e) =>
                  handleSaveSetting("response_time_display", e.target.value)
                }
                style={{ ...inputStyle, width: "160px" }}
                placeholder="e.g 1 hour"
              />
            </div>

            {/* Global Auto-Assign Toggle */}
            <div
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #f8faf8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#0a1628",
                  }}
                >
                  Auto-Assignment
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  When enabled, agents can toggle auto-assign on their cards.
                  When disabled, the toggle is hidden on all agent cards.
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: autoAssignEnabled ? "#0f5c2e" : "#94a3b8",
                  }}
                >
                  {autoAssignEnabled ? "Enabled" : "Disabled"}
                </span>
                <div
                  onClick={() =>
                    handleSaveSetting(
                      "auto_assign_enabled",
                      autoAssignEnabled ? "false" : "true",
                    )
                  }
                  style={{
                    width: "52px",
                    height: "28px",
                    borderRadius: "100px",
                    background: autoAssignEnabled ? "#0f5c2e" : "#d1dbd1",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: "3px",
                      left: autoAssignEnabled ? "27px" : "3px",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Auto-Assign Method — only show when enabled */}
            {autoAssignEnabled && (
              <div
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid #f8faf8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#0a1628",
                    }}
                  >
                    Assignment Method
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    How filings are distributed among agents
                  </p>
                </div>
                <select
                  value={autoAssignMethod}
                  onChange={(e) =>
                    handleSaveSetting("auto_assign_method", e.target.value)
                  }
                  style={{ ...inputStyle, width: "200px" }}
                >
                  <option value="round_robin">🔄 Round Robin</option>
                  <option value="least_loaded">⚖️ Least Loaded</option>
                </select>
              </div>
            )}

            {/* Frequency — only show when enabled */}
            {autoAssignEnabled && (
              <div
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid #f8faf8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#0a1628",
                    }}
                  >
                    Assignment Frequency
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    When to distribute new tickets to agents
                  </p>
                </div>
                <select
                  value={assignFrequency}
                  onChange={(e) =>
                    handleSaveSetting("assign_frequency", e.target.value)
                  }
                  style={{ ...inputStyle, width: "200px" }}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Max Filings — only show when enabled */}
            {autoAssignEnabled && (
              <div
                style={{
                  padding: "16px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#0a1628",
                    }}
                  >
                    Max Filings Per Agent
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    Maximum active filings an agent can receive
                  </p>
                </div>
                <input
                  type="number"
                  defaultValue={maxFilings}
                  onBlur={(e) =>
                    handleSaveSetting("max_filings_per_agent", e.target.value)
                  }
                  style={{ ...inputStyle, width: "100px" }}
                  min={1}
                  max={100}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2 — SLA Configuration */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e8ede8",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid #f1f5f1",
              background: "#f8faf8",
            }}
          >
            <h2
              style={{ fontSize: "17px", fontWeight: "800", color: "#0a1628" }}
            >
              ⏱️ SLA Configuration
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              Set response time targets for each filing type
            </p>
          </div>
          <div>
            {loading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading...
              </div>
            ) : (
              slaConfigs.map((config, i) => (
                <div
                  key={config.id}
                  style={{
                    padding: "16px 22px",
                    borderBottom:
                      i < slaConfigs.length - 1 ? "1px solid #f8faf8" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>
                        {FILING_ICONS[config.filingType]}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: "#0a1628",
                          }}
                        >
                          {FILING_LABELS[config.filingType]}
                        </p>
                        {editingSLA === config.filingType ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "10px",
                              marginTop: "10px",
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                Response Time (hrs)
                              </label>
                              <input
                                type="number"
                                value={editingSLAValues.responseTimeHrs}
                                onChange={(e) =>
                                  setEditingSLAValues({
                                    ...editingSLAValues,
                                    responseTimeHrs: parseInt(e.target.value),
                                  })
                                }
                                style={{
                                  ...inputStyle,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                Display Text
                              </label>
                              <input
                                type="text"
                                value={editingSLAValues.displayText}
                                onChange={(e) =>
                                  setEditingSLAValues({
                                    ...editingSLAValues,
                                    displayText: e.target.value,
                                  })
                                }
                                style={{
                                  ...inputStyle,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                Warning At (hrs)
                              </label>
                              <input
                                type="number"
                                value={editingSLAValues.warningAtHrs}
                                onChange={(e) =>
                                  setEditingSLAValues({
                                    ...editingSLAValues,
                                    warningAtHrs: parseInt(e.target.value),
                                  })
                                }
                                style={{
                                  ...inputStyle,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              marginTop: "4px",
                            }}
                          >
                            <span
                              style={{ fontSize: "13px", color: "#64748b" }}
                            >
                              Target:{" "}
                              <strong style={{ color: "#0a1628" }}>
                                {config.responseTimeHrs}hrs
                              </strong>
                            </span>
                            <span
                              style={{ fontSize: "13px", color: "#64748b" }}
                            >
                              Shown as:{" "}
                              <strong style={{ color: "#0f5c2e" }}>
                                "{config.displayText}"
                              </strong>
                            </span>
                            <span
                              style={{ fontSize: "13px", color: "#64748b" }}
                            >
                              Warning at:{" "}
                              <strong style={{ color: "#d97706" }}>
                                {config.warningAtHrs}hrs
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexShrink: 0,
                        marginLeft: "16px",
                      }}
                    >
                      {editingSLA === config.filingType ? (
                        <>
                          <button
                            onClick={() => handleSaveSLA(config.filingType)}
                            style={{
                              padding: "8px 16px",
                              background: "#0f5c2e",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSLA(null)}
                            style={{
                              padding: "8px 16px",
                              border: "1px solid #d1dbd1",
                              borderRadius: "8px",
                              fontSize: "13px",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingSLA(config.filingType);
                            setEditingSLAValues({
                              responseTimeHrs: config.responseTimeHrs,
                              displayText: config.displayText,
                              warningAtHrs: config.warningAtHrs,
                            });
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#0a1628",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3 — Pricing */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e8ede8",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid #f1f5f1",
              background: "#f8faf8",
            }}
          >
            <h2
              style={{ fontSize: "17px", fontWeight: "800", color: "#0a1628" }}
            >
              💰 Pricing
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              Adjust service fees and government fees per filing type
            </p>
          </div>
          <div>
            {loading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading...
              </div>
            ) : (
              prices.map((price, i) => (
                <div
                  key={price.id}
                  style={{
                    padding: "16px 22px",
                    borderBottom:
                      i < prices.length - 1 ? "1px solid #f8faf8" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>
                        {FILING_ICONS[price.filingType]}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: "#0a1628",
                          }}
                        >
                          {FILING_LABELS[price.filingType]}
                        </p>
                        {editingPrice === price.filingType ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "10px",
                              marginTop: "10px",
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                Service Fee (₦)
                              </label>
                              <input
                                type="number"
                                value={editingPriceValues.serviceFee}
                                onChange={(e) =>
                                  setEditingPriceValues({
                                    ...editingPriceValues,
                                    serviceFee: e.target.value,
                                  })
                                }
                                style={{
                                  ...inputStyle,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                Govt Fee (₦)
                              </label>
                              <input
                                type="number"
                                value={editingPriceValues.govtFee}
                                onChange={(e) =>
                                  setEditingPriceValues({
                                    ...editingPriceValues,
                                    govtFee: e.target.value,
                                  })
                                }
                                style={{
                                  ...inputStyle,
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              marginTop: "4px",
                            }}
                          >
                            <span
                              style={{ fontSize: "13px", color: "#64748b" }}
                            >
                              Service Fee:{" "}
                              <strong style={{ color: "#0f5c2e" }}>
                                {formatCurrency(price.serviceFee)}
                              </strong>
                            </span>
                            <span
                              style={{ fontSize: "13px", color: "#64748b" }}
                            >
                              Govt Fee:{" "}
                              <strong style={{ color: "#0a1628" }}>
                                {formatCurrency(price.govtFee)}
                              </strong>
                            </span>
                            <span
                              style={{ fontSize: "13px", color: "#64748b" }}
                            >
                              Total:{" "}
                              <strong style={{ color: "#0a1628" }}>
                                {formatCurrency(
                                  price.serviceFee + price.govtFee,
                                )}
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexShrink: 0,
                        marginLeft: "16px",
                      }}
                    >
                      {editingPrice === price.filingType ? (
                        <>
                          <button
                            onClick={() => handleSavePrice(price.filingType)}
                            style={{
                              padding: "8px 16px",
                              background: "#0f5c2e",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPrice(null)}
                            style={{
                              padding: "8px 16px",
                              border: "1px solid #d1dbd1",
                              borderRadius: "8px",
                              fontSize: "13px",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPrice(price.filingType);
                            setEditingPriceValues({
                              serviceFee: price.serviceFee,
                              govtFee: price.govtFee,
                            });
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#0a1628",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppSettings;
