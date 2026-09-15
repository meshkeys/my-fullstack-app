import jsPDF from "jspdf";

export const printFilingAsPDF = async (filing) => {
  const formData = filing.formData || {};

  const formatFilingType = (type) =>
    ({
      ANNUAL_RETURNS: "Annual Returns",
      CHANGE_OF_DIRECTORS: "Change of Directors",
      CHANGE_OF_ADDRESS: "Change of Address",
      CHANGE_OF_NAME: "Change of Name",
      INCREASE_SHARE_CAPITAL: "Increase Share Capital",
      AUDITED_ACCOUNTS: "Audited Accounts",
    })[type] || type;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Header
  pdf.setFillColor(15, 92, 46);
  pdf.rect(0, 0, pageWidth, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("CAC Filing", 15, 15);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("Client Submission Document", 15, 23);

  y = 45;

  // Filing Info
  pdf.setTextColor(10, 22, 40);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${formatFilingType(filing.filingType)}`, 15, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `Submitted: ${new Date(filing.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}`,
    15,
    y,
  );
  pdf.text(`Status: ${filing.status.replace(/_/g, " ")}`, 120, y);
  y += 15;

  // Client Info
  pdf.setFillColor(248, 250, 248);
  pdf.rect(15, y - 5, pageWidth - 30, 25, "F");
  pdf.setTextColor(10, 22, 40);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("CLIENT INFORMATION", 20, y + 3);
  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Name: ${filing.business?.user?.fullName || "N/A"}`, 20, y + 2);
  pdf.text(`Email: ${filing.business?.user?.email || "N/A"}`, 20, y + 8);
  y += 22;

  // Business Info
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("BUSINESS INFORMATION", 15, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Business Name: ${filing.business?.businessName || "N/A"}`, 15, y);
  y += 6;
  pdf.text(
    `Business Type: ${filing.business?.businessType?.replace(/_/g, " ") || "N/A"}`,
    15,
    y,
  );
  y += 6;
  pdf.text(`RC Number: ${filing.business?.rcNumber || "N/A"}`, 15, y);
  y += 12;

  // Divider
  pdf.setDrawColor(232, 237, 232);
  pdf.line(15, y, pageWidth - 15, y);
  y += 8;

  // Form Data
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(15, 92, 46);
  pdf.text("SUBMITTED INFORMATION", 15, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(10, 22, 40);

  Object.entries(formData).forEach(([key, value]) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
    const label = key.replace(/([A-Z])/g, " $1").trim();
    pdf.setFont("helvetica", "bold");
    pdf.text(`${label.charAt(0).toUpperCase() + label.slice(1)}:`, 15, y);
    pdf.setFont("helvetica", "normal");

    const lines = pdf.splitTextToSize(String(value || "N/A"), pageWidth - 80);
    pdf.text(lines, 80, y);
    y += Math.max(7, lines.length * 5 + 2);
  });

  // Footer
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `CAC Filing — Confidential Client Document — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  pdf.save(
    `${filing.business?.businessName}_${formatFilingType(filing.filingType)}_${new Date().toLocaleDateString()}.pdf`,
  );
};
