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

function AdminSLA() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSLA, setEditingSLA] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [editingSetting, setEditingSetting] = useState(null);
  const [settingValue, setSettingValue] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const [slaRes, settingsRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/sla`, { headers }),
        axios.get(`${baseUrl}/api/admin/settings`, { headers }),
      ]);
      setConfigs(slaRes.data.configs);
      setSettings(settingsRes.data.settings);
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

  const handleSaveSLA = async (filingType) => {
    try {
      await axios.put(`${baseUrl}/api/admin/sla/${filingType}`, editingValues, {
        headers,
      });
      setSuccessMsg("SLA updated successfully!");
      setEditingSLA(null);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating SLA:", error);
    }
  };

  const handleSaveSetting = async (key) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/settings/${key}`,
        { value: settingValue },
        { headers },
      );
      setSuccessMsg("Setting updated successfully!");
      setEditingSetting(null);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  };

  const settingLabels = {
    response_time_display: "Response Time (shown to customers)",
    auto_assign_enabled: "Auto-Assignment Enabled",
    auto_assign_method: "Auto-Assignment Method",
    max_filings_per_agent: "Max Filings Per Agent",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f4",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
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
          ← Back
        </button>
        <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
          CAC<span style={{ color: "#4ade80" }}>Filing</span> · SLA & Settings
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

        {/* App Settings */}
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
              ⚙️ App Settings
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              Control how the app behaves and what customers see
            </p>
          </div>
          <div style={{ padding: "8px 0" }}>
            {settings.map((setting) => (
              <div
                key={setting.key}
                style={{
                  padding: "14px 22px",
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
                    {settingLabels[setting.key] || setting.key}
                  </p>
                  {setting.description && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      {setting.description}
                    </p>
                  )}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {editingSetting === setting.key ? (
                    <>
                      <input
                        value={settingValue}
                        onChange={(e) => setSettingValue(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          border: "1.5px solid #0f5c2e",
                          borderRadius: "8px",
                          fontSize: "14px",
                          width: "160px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => handleSaveSetting(setting.key)}
                        style={{
                          padding: "8px 14px",
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
                        onClick={() => setEditingSetting(null)}
                        style={{
                          padding: "8px 14px",
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
                    <>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          background: "#f8faf8",
                          border: "1px solid #e8ede8",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0a1628",
                        }}
                      >
                        {setting.value}
                      </span>
                      <button
                        onClick={() => {
                          setEditingSetting(setting.key);
                          setSettingValue(setting.value);
                        }}
                        style={{
                          padding: "8px 14px",
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
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Configuration */}
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
              ⏱️ SLA Configuration
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              Set response time targets for each filing type
            </p>
          </div>
          <div style={{ padding: "8px 0" }}>
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
              configs.map((config) => (
                <div
                  key={config.id}
                  style={{
                    padding: "16px 22px",
                    borderBottom: "1px solid #f8faf8",
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
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>
                        {FILING_ICONS[config.filingType]}
                      </span>
                      <div>
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
                              marginTop: "12px",
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
                                value={editingValues.responseTimeHrs}
                                onChange={(e) =>
                                  setEditingValues({
                                    ...editingValues,
                                    responseTimeHrs: parseInt(e.target.value),
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1.5px solid #0f5c2e",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  outline: "none",
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
                                value={editingValues.displayText}
                                onChange={(e) =>
                                  setEditingValues({
                                    ...editingValues,
                                    displayText: e.target.value,
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1.5px solid #0f5c2e",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  outline: "none",
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
                                value={editingValues.warningAtHrs}
                                onChange={(e) =>
                                  setEditingValues({
                                    ...editingValues,
                                    warningAtHrs: parseInt(e.target.value),
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1.5px solid #0f5c2e",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  outline: "none",
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
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
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
                            setEditingValues({
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
      </div>
    </div>
  );
}

export default AdminSLA;
