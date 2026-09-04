import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [filings, setFilings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, filingsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/admin/stats`, { headers }),
          axios.get(
            `${baseUrl}/api/admin/filings${filter !== "ALL" ? `?status=${filter}` : ""}`,
            { headers },
          ),
        ]);
        setStats(statsRes.data.stats);
        setFilings(filingsRes.data.filings);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        if (error.response?.status === 403) {
          navigate("/admin");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      IN_REVIEW: "bg-blue-100 text-blue-700",
      AWAITING_INFO: "bg-orange-100 text-orange-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SUBMITTED_TO_CAC: "bg-indigo-100 text-indigo-700",
      COMPLETED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatFilingType = (type) => {
    const types = {
      ANNUAL_RETURNS: "Annual Returns",
      CHANGE_OF_DIRECTORS: "Change of Directors",
      CHANGE_OF_ADDRESS: "Change of Address",
      CHANGE_OF_NAME: "Change of Name",
      INCREASE_SHARE_CAPITAL: "Increase Share Capital",
      AUDITED_ACCOUNTS: "Audited Accounts",
    };
    return types[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">⚖️ CAC Filing</span>
          <span className="text-gray-400 text-sm">Admin Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">👋 {adminUser.fullName}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Filings",
                value: stats.totalFilings,
                icon: "📋",
                color: "bg-blue-500",
              },
              {
                label: "Pending Review",
                value: stats.pendingFilings,
                icon: "⏳",
                color: "bg-yellow-500",
              },
              {
                label: "Awaiting Info",
                value: stats.awaitingInfoFilings,
                icon: "📎",
                color: "bg-orange-500",
              },
              {
                label: "Completed",
                value: stats.completedFilings,
                icon: "✅",
                color: "bg-green-500",
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-white text-lg ${stat.color} mb-3`}
                >
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="text-3xl">👥</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-gray-500">Registered Users</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="text-3xl">🏢</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalBusinesses}
                </p>
                <p className="text-sm text-gray-500">Registered Businesses</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            {[
              "ALL",
              "PENDING",
              "IN_REVIEW",
              "AWAITING_INFO",
              "PROCESSING",
              "SUBMITTED_TO_CAC",
              "COMPLETED",
              "REJECTED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  filter === status
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Filings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              {filter === "ALL"
                ? "All Filings"
                : `${filter.replace(/_/g, " ")} Filings`}
              <span className="ml-2 text-gray-400 font-normal text-sm">
                ({filings.length})
              </span>
            </h2>
          </div>

          {filings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No filings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Filing Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filings.map((filing) => (
                    <tr key={filing.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {filing.business?.user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {filing.business?.user?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {filing.business?.businessName}
                        </p>
                        {filing.business?.rcNumber && (
                          <p className="text-xs text-green-600">
                            RC: {filing.business.rcNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {formatFilingType(filing.filingType)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {formatCurrency(filing.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(filing.status)}`}
                        >
                          {filing.status.replace(/_/g, " ")}
                        </span>
                        {filing.messages?.length > 0 &&
                          filing.messages[0].sender === "USER" &&
                          !filing.messages[0].isRead && (
                            <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">
                          {new Date(filing.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/filing/${filing.id}`)}
                          className="px-3 py-1.5 bg-green-800 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
