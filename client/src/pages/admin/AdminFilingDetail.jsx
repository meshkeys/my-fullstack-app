import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function AdminFilingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filing, setFiling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showDocRequest, setShowDocRequest] = useState(false);
  const [docMessage, setDocMessage] = useState('');
  const [requestedDocs, setRequestedDocs] = useState(['']);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchFiling = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/admin/filings/${id}`, { headers });
      setFiling(response.data.filing);
      setNewStatus(response.data.filing.status);
    } catch (error) {
      console.error('Error fetching filing:', error);
      if (error.response?.status === 403) navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchFiling();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filing?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await axios.post(`${baseUrl}/api/admin/filings/${id}/message`, { message }, { headers });
      setMessage('');
      fetchFiling();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/filings/${id}/status`,
        { status: newStatus, notes: statusNote },
        { headers }
      );
      setStatusNote('');
      fetchFiling();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRequestDocs = async (e) => {
    e.preventDefault();
    const docs = requestedDocs.filter(d => d.trim() !== '');
    if (!docMessage || docs.length === 0) return;

    try {
      await axios.post(
        `${baseUrl}/api/admin/filings/${id}/request-docs`,
        { message: docMessage, requestedDocs: docs },
        { headers }
      );
      setShowDocRequest(false);
      setDocMessage('');
      setRequestedDocs(['']);
      fetchFiling();
      alert('Document request sent to client!');
    } catch (error) {
      console.error('Error requesting docs:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      IN_REVIEW: 'bg-blue-100 text-blue-700',
      AWAITING_INFO: 'bg-orange-100 text-orange-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SUBMITTED_TO_CAC: 'bg-indigo-100 text-indigo-700',
      COMPLETED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatFilingType = (type) => {
    const types = {
      ANNUAL_RETURNS: 'Annual Returns',
      CHANGE_OF_DIRECTORS: 'Change of Directors',
      CHANGE_OF_ADDRESS: 'Change of Address',
      CHANGE_OF_NAME: 'Change of Name',
      INCREASE_SHARE_CAPITAL: 'Increase Share Capital',
      AUDITED_ACCOUNTS: 'Audited Accounts',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!filing) return null;

  const formData = filing.formData || {};

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-gray-300 hover:text-white text-sm flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
        <span className="text-lg font-bold">⚖️ Filing Detail</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(filing.status)}`}>
          {filing.status.replace(/_/g, ' ')}
        </span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column — Filing Info */}
          <div className="md:col-span-2 space-y-6">

            {/* Client & Filing Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 text-lg mb-4">
                {formatFilingType(filing.filingType)}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Client</p>
                  <p className="font-medium text-gray-800">{filing.business?.user?.fullName}</p>
                  <p className="text-gray-500">{filing.business?.user?.email}</p>
                  <p className="text-gray-500">{filing.business?.user?.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Business</p>
                  <p className="font-medium text-gray-800">{filing.business?.businessName}</p>
                  <p className="text-gray-500">{filing.business?.businessType?.replace(/_/g, ' ')}</p>
                  {filing.business?.rcNumber && (
                    <p className="text-green-600 font-medium">RC: {filing.business.rcNumber}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Submitted</p>
                  <p className="text-gray-800">{new Date(filing.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Amount</p>
                  <p className="font-bold text-green-700 text-lg">
                    ₦{(filing.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Data — Client Submission */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">📋 Client Submitted Information</h3>
              {Object.keys(formData).length === 0 ? (
                <p className="text-gray-400 text-sm">No form data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="flex gap-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400 capitalize w-48 flex-shrink-0">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages Thread */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">💬 Communication Thread</h3>
              </div>

              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {filing.messages?.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">No messages yet</p>
                ) : (
                  filing.messages?.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'AGENT' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-sm rounded-2xl p-3 ${
                        msg.sender === 'AGENT'
                          ? 'bg-gray-900 text-white rounded-br-none'
                          : 'bg-green-50 text-gray-800 border border-green-100 rounded-bl-none'
                      }`}>
                        <p className={`text-xs font-medium mb-1 ${
                          msg.sender === 'AGENT' ? 'text-gray-400' : 'text-green-600'
                        }`}>
                          {msg.sender === 'AGENT' ? '👨‍💼 You (Agent)' : `👤 ${filing.business?.user?.fullName}`}
                        </p>
                        <p className="text-sm">{msg.message}</p>

                        {/* Show uploaded documents */}
                        {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-green-400">📎 Uploaded files:</p>
                            {msg.attachments.map((file, i) => (
                              <a
                                key={i}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-300 underline"
                              >
                                {file.name}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Show requested docs */}
                        {msg.requestedDocs && Array.isArray(msg.requestedDocs) && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-orange-300">📎 Requested:</p>
                            {msg.requestedDocs.map((doc, i) => (
                              <p key={i} className="text-xs text-gray-300">• {doc}</p>
                            ))}
                          </div>
                        )}

                        <p className={`text-xs mt-1 ${msg.sender === 'AGENT' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleDateString('en-NG', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message to the client..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Right Column — Actions */}
          <div className="space-y-6">

            {/* Update Status */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">📊 Update Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {['PENDING', 'IN_REVIEW', 'AWAITING_INFO', 'PROCESSING', 'SUBMITTED_TO_CAC', 'COMPLETED', 'REJECTED'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note (optional)..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                onClick={handleUpdateStatus}
                className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition"
              >
                Update Status
              </button>
            </div>

            {/* Request Documents */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">📎 Request Documents</h3>
              {!showDocRequest ? (
                <button
                  onClick={() => setShowDocRequest(true)}
                  className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition"
                >
                  Request Documents from Client
                </button>
              ) : (
                <form onSubmit={handleRequestDocs} className="space-y-3">
                  <textarea
                    value={docMessage}
                    onChange={(e) => setDocMessage(e.target.value)}
                    placeholder="Message to client explaining why you need these documents..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Documents needed:</p>
                    {requestedDocs.map((doc, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={doc}
                          onChange={(e) => {
                            const updated = [...requestedDocs];
                            updated[i] = e.target.value;
                            setRequestedDocs(updated);
                          }}
                          placeholder={`Document ${i + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        {requestedDocs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRequestedDocs(requestedDocs.filter((_, idx) => idx !== i))}
                            className="text-red-500 text-sm px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRequestedDocs([...requestedDocs, ''])}
                      className="text-xs text-orange-600 hover:underline"
                    >
                      + Add another document
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDocRequest(false)}
                      className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Status Buttons */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    setNewStatus('IN_REVIEW');
                    await axios.put(`${baseUrl}/api/admin/filings/${id}/status`, { status: 'IN_REVIEW' }, { headers });
                    fetchFiling();
                  }}
                  className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition"
                >
                  ✅ Mark as In Review
                </button>
                <button
                  onClick={async () => {
                    setNewStatus('PROCESSING');
                    await axios.put(`${baseUrl}/api/admin/filings/${id}/status`, { status: 'PROCESSING' }, { headers });
                    fetchFiling();
                  }}
                  className="w-full py-2 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 transition"
                >
                  ⚙️ Mark as Processing
                </button>
                <button
                  onClick={async () => {
                    setNewStatus('SUBMITTED_TO_CAC');
                    await axios.put(`${baseUrl}/api/admin/filings/${id}/status`, { status: 'SUBMITTED_TO_CAC' }, { headers });
                    fetchFiling();
                  }}
                  className="w-full py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition"
                >
                  📤 Submitted to CAC
                </button>
                <button
                  onClick={async () => {
                    setNewStatus('COMPLETED');
                    await axios.put(`${baseUrl}/api/admin/filings/${id}/status`, { status: 'COMPLETED' }, { headers });
                    fetchFiling();
                  }}
                  className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition"
                >
                  🎉 Mark as Completed
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to reject this filing?')) {
                      setNewStatus('REJECTED');
                      await axios.put(`${baseUrl}/api/admin/filings/${id}/status`, { status: 'REJECTED' }, { headers });
                      fetchFiling();
                    }
                  }}
                  className="w-full py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition"
                >
                  ❌ Reject Filing
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFilingDetail;