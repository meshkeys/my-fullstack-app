import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

function FilingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filing, setFiling] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState({});
  const messagesEndRef = useRef(null);

  const fetchFiling = async () => {
    try {
      const response = await api.get(`/api/filings/${id}/messages`);
      setFiling(response.data.filing);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching filing:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiling();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchFiling, 30000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/filings/${id}/messages`, { message: reply });
      setReply("");
      fetchFiling();
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSending(false);
    }
  };

  const handleUploadDocs = async (messageId) => {
    const files = uploadFiles[messageId];
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("messageId", messageId);
      Array.from(files).forEach((file) => {
        formData.append("documents", file);
      });

      await api.post(`/api/filings/${id}/upload-docs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadFiles({});
      fetchFiling();
      alert("Documents uploaded successfully!");
    } catch (error) {
      console.error("Error uploading docs:", error);
    } finally {
      setUploading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-green-800 font-medium">
            Loading filing details...
          </p>
        </div>
      </div>
    );
  }

  if (!filing) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Filing not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-green-700 underline"
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
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-800">CAC</span>
          <span className="text-xl font-semibold text-green-600">Filing</span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(filing.status)}`}
        >
          {filing.status.replace(/_/g, " ")}
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Filing Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h1 className="text-xl font-bold text-green-900">
            {formatFilingType(filing.filingType)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {filing.business?.businessName}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(filing.status)}`}
            >
              {filing.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-gray-400">
              Submitted{" "}
              {new Date(filing.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* AWAITING_INFO Banner */}
          {filing.status === "AWAITING_INFO" && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm font-semibold text-orange-800">
                ⚠️ Action Required
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Our agent has requested additional information. Please scroll
                down to respond.
              </p>
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">💬 Filing Updates</h2>
            <p className="text-xs text-gray-400 mt-1">
              Communication between you and our legal team
            </p>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No messages yet</p>
                <p className="text-gray-300 text-xs mt-1">
                  Our agent will update you here once they start reviewing your
                  filing
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-sm rounded-2xl p-3 ${
                      msg.sender === "USER"
                        ? "bg-green-800 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium mb-1 ${
                        msg.sender === "USER"
                          ? "text-green-200"
                          : "text-gray-500"
                      }`}
                    >
                      {msg.sender === "USER" ? "You" : "👨‍💼 Legal Agent"}
                    </p>
                    <p className="text-sm">{msg.message}</p>

                    {/* Document Request from Agent */}
                    {msg.requiresAction &&
                      msg.actionType === "UPLOAD_DOCUMENT" &&
                      msg.requestedDocs && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-orange-200">
                          <p className="text-xs font-bold text-orange-700 mb-2">
                            📎 Documents Requested:
                          </p>
                          <ul className="space-y-1 mb-3">
                            {(Array.isArray(msg.requestedDocs)
                              ? msg.requestedDocs
                              : []
                            ).map((doc, i) => (
                              <li
                                key={i}
                                className="text-xs text-gray-700 flex items-center gap-1"
                              >
                                <span>•</span> {doc}
                              </li>
                            ))}
                          </ul>

                          {/* Check if already uploaded */}
                          {msg.attachments &&
                          Array.isArray(msg.attachments) &&
                          msg.attachments.length > 0 ? (
                            <div className="mt-2">
                              <p className="text-xs text-green-600 font-medium">
                                ✅ Documents uploaded
                              </p>
                              {msg.attachments.map((file, i) => (
                                <a
                                  key={i}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-600 underline mt-1"
                                >
                                  {file.name}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2">
                              <input
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  setUploadFiles({
                                    ...uploadFiles,
                                    [msg.id]: e.target.files,
                                  })
                                }
                                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 cursor-pointer"
                              />
                              {uploadFiles[msg.id] &&
                                uploadFiles[msg.id].length > 0 && (
                                  <button
                                    onClick={() => handleUploadDocs(msg.id)}
                                    disabled={uploading}
                                    className="mt-2 w-full py-1.5 bg-green-800 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                  >
                                    {uploading
                                      ? "Uploading..."
                                      : `Upload ${uploadFiles[msg.id].length} file(s) →`}
                                  </button>
                                )}
                            </div>
                          )}
                        </div>
                      )}

                    <p
                      className={`text-xs mt-2 ${
                        msg.sender === "USER"
                          ? "text-green-300"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a message to our agent..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="px-4 py-2 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilingDetail;
