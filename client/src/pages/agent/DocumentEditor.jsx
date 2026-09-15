import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import {
  DOCUMENT_TEMPLATES,
  generateDocumentContent,
} from "../../utils/documentTemplates";


function DocumentEditor() {
  const { filingId, templateId } = useParams();
  const navigate = useNavigate();
  const [filing, setFiling] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const templateName =
    Object.values(DOCUMENT_TEMPLATES)
      .flat()
      .find((t) => t.id === templateId)?.name || "Document";

  useEffect(() => {
    const fetchFiling = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/admin/filings/${filingId}`,
          { headers },
        );
        setFiling(res.data.filing);
        setContent(generateDocumentContent(templateId, res.data.filing));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiling();
  }, [filingId]);

  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiSuggestion("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a Nigerian corporate lawyer assistant helping prepare CAC (Corporate Affairs Commission) documents. 

Current document type: ${templateName}
Client business: ${filing?.business?.businessName}
Filing type: ${filing?.filingType}

Current document content:
${content}

Agent's request: ${aiPrompt}

Please provide specific suggestions or improvements to this document. Keep it professional, legally appropriate for Nigerian corporate law, and ready for CAC filing. Be concise and practical.`,
            },
          ],
        }),
      });
      const data = await response.json();
      setAiSuggestion(data.content?.[0]?.text || "No suggestion available");
    } catch {
      setAiSuggestion("Error getting AI suggestion. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    setContent(
      (prev) => prev + "\n\n--- AI SUGGESTED ADDITION ---\n" + aiSuggestion,
    );
    setAiSuggestion("");
    setAiPrompt("");
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Header
    pdf.setFillColor(15, 92, 46);
    pdf.rect(0, 0, pageWidth, 20, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("CAC Filing — Legal Document", margin, 13);

    let y = 30;
    pdf.setTextColor(10, 22, 40);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const lines = content.split("\n");
    lines.forEach((line) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      if (line.trim() === "") {
        y += 4;
        return;
      }
      // Check if line is a header (all caps)
      if (line === line.toUpperCase() && line.trim().length > 3) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
      }
      const wrappedLines = pdf.splitTextToSize(line, maxWidth);
      pdf.text(wrappedLines, margin, y);
      y += wrappedLines.length * 6;
    });

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `${filing?.business?.businessName} — ${templateName} — Page ${i} of ${pageCount} — Prepared by CAC Filing`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 8,
        { align: "center" },
      );
    }

    pdf.save(
      `${filing?.business?.businessName}_${templateName.replace(/\s/g, "_")}.pdf`,
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f6f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: "16px", color: "#64748b" }}>
          Loading document editor...
        </p>
      </div>
    );
  }

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
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate(`/admin/filing/${filingId}`)}
          style={{
            color: "#94a3b8",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Filing
        </button>
        <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>
          CAC<span style={{ color: "#4ade80" }}>Filing</span> · {templateName}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: "8px 16px",
              background: "#0f5c2e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            📥 Download PDF
          </button>
        </div>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "16px",
          padding: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Document Editor */}
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
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8faf8",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#0a1628",
                }}
              >
                {templateName}
              </h2>
              <p
                style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}
              >
                {filing?.business?.businessName} · {filing?.business?.rcNumber}
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
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
              📥 Save as PDF
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "700px",
              padding: "24px",
              border: "none",
              outline: "none",
              fontSize: "14px",
              lineHeight: "1.8",
              fontFamily: "'Courier New', monospace",
              color: "#0a1628",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Right Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* AI Assistant */}
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
                padding: "14px 18px",
                borderBottom: "1px solid #f1f5f1",
                background: "linear-gradient(135deg, #0a1628, #1e293b)",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: "2px",
                }}
              >
                🤖 AI Legal Assistant
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                Powered by Claude AI
              </p>
            </div>
            <div style={{ padding: "14px" }}>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI for help e.g. 'Make this board resolution more formal' or 'Add a clause about the director's responsibilities'"
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #d1dbd1",
                  borderRadius: "8px",
                  fontSize: "13px",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleAIAssist}
                disabled={aiLoading || !aiPrompt.trim()}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: aiLoading ? "#64748b" : "#0a1628",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                {aiLoading ? "⏳ Thinking..." : "✨ Get AI Suggestion"}
              </button>

              {aiSuggestion && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#0f5c2e",
                      marginBottom: "6px",
                    }}
                  >
                    AI Suggestion:
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#0a1628",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {aiSuggestion}
                  </p>
                  <button
                    onClick={applyAISuggestion}
                    style={{
                      marginTop: "8px",
                      padding: "6px 14px",
                      background: "#0f5c2e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Apply to Document
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Client Data Reference */}
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
                padding: "14px 18px",
                borderBottom: "1px solid #f1f5f1",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "#0a1628",
                }}
              >
                📋 Client Data
              </h3>
            </div>
            <div
              style={{ padding: "14px", maxHeight: "300px", overflowY: "auto" }}
            >
              {filing?.formData &&
                Object.entries(filing.formData).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      marginBottom: "8px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #f8faf8",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#0a1628",
                        fontWeight: "500",
                        marginTop: "2px",
                      }}
                    >
                      {value || "—"}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#92400e",
                marginBottom: "10px",
              }}
            >
              💡 Quick Tips
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {[
                "Review all auto-filled fields for accuracy",
                "Replace any [PLACEHOLDER] text with actual data",
                "Ensure dates are correct and consistent",
                "Use AI assistant to refine legal language",
                "Download PDF for client signature",
              ].map((tip, i) => (
                <p key={i} style={{ fontSize: "12px", color: "#92400e" }}>
                  • {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentEditor;
