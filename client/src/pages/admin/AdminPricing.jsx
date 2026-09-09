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

function AdminPricing() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchPrices = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/admin/prices`, { headers });
      setPrices(res.data.prices);
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchPrices();
  }, []);

  const handleEdit = (price) => {
    setEditing(price.filingType);
    setEditValues({
      serviceFee: price.serviceFee,
      govtFee: price.govtFee,
    });
  };

  const handleSave = async (filingType) => {
    setSaving(true);
    try {
      await axios.put(`${baseUrl}/api/admin/prices/${filingType}`, editValues, {
        headers,
      });
      setSuccessMsg(`${FILING_LABELS[filingType]} price updated!`);
      setEditing(null);
      fetchPrices();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating price:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-gray-300 hover:text-white text-sm flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
        <span className="text-lg font-bold">💰 Pricing Management</span>
        <span className="text-gray-400 text-sm">Admin Portal</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h1 className="text-xl font-bold text-gray-800">Filing Prices</h1>
          <p className="text-gray-500 text-sm mt-1">
            Update service fees and government fees for each filing type.
            Changes take effect immediately.
          </p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            ✅ {successMsg}
          </div>
        )}

        {/* Prices Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Filing Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Govt Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Loading prices...
                  </td>
                </tr>
              ) : (
                prices.map((price) => (
                  <tr key={price.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {FILING_ICONS[price.filingType]}
                        </span>
                        <p className="text-sm font-medium text-gray-800">
                          {FILING_LABELS[price.filingType]}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editing === price.filingType ? (
                        <input
                          type="number"
                          value={editValues.serviceFee}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              serviceFee: e.target.value,
                            })
                          }
                          className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-800">
                          {formatCurrency(price.serviceFee)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === price.filingType ? (
                        <input
                          type="number"
                          value={editValues.govtFee}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              govtFee: e.target.value,
                            })
                          }
                          className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {formatCurrency(price.govtFee)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-green-700">
                        {editing === price.filingType
                          ? formatCurrency(
                              parseFloat(editValues.serviceFee || 0) +
                                parseFloat(editValues.govtFee || 0),
                            )
                          : formatCurrency(price.serviceFee + price.govtFee)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-400">
                        {new Date(price.updatedAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {price.updatedBy && (
                        <p className="text-xs text-gray-300">
                          by {price.updatedBy}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === price.filingType ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(price.filingType)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {saving ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(price)}
                          className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition"
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-800 font-medium">
            💡 How pricing works
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Service Fee — charged by CAC Filing for document preparation and
            filing assistance.
            <br />
            Government Fee — CAC statutory fee paid to the government. Currently
            ₦3,000 for most filings.
            <br />
            Total = Service Fee + Government Fee shown to clients at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminPricing;
