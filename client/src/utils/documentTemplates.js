export const DOCUMENT_TEMPLATES = {
  ANNUAL_RETURNS: [
    {
      id: "annual_returns_summary",
      name: "Financial Summary",
      description: "Summary of annual financial performance",
      icon: "📊",
    },
    {
      id: "directors_report",
      name: "Director's Report",
      description: "Annual director's report to shareholders",
      icon: "📝",
    },
    {
      id: "board_resolution_ar",
      name: "Board Resolution (Annual Returns)",
      description: "Board resolution approving annual returns filing",
      icon: "⚖️",
    },
  ],
  CHANGE_OF_DIRECTORS: [
    {
      id: "board_resolution_cod",
      name: "Board Resolution (Director Change)",
      description: "Resolution approving appointment/removal of director",
      icon: "⚖️",
    },
    {
      id: "consent_to_act",
      name: "Consent to Act as Director",
      description: "New director's consent letter",
      icon: "✅",
    },
    {
      id: "shareholders_resolution",
      name: "Shareholders' Resolution",
      description: "Resolution from shareholders approving the change",
      icon: "👥",
    },
    {
      id: "directors_particulars",
      name: "Director's Particulars Form",
      description: "Personal details of incoming/outgoing director",
      icon: "👤",
    },
  ],
  CHANGE_OF_ADDRESS: [
    {
      id: "board_resolution_coa",
      name: "Board Resolution (Change of Address)",
      description: "Resolution approving new registered address",
      icon: "⚖️",
    },
    {
      id: "notice_of_address_change",
      name: "Notice of Change of Address",
      description: "Formal notice of address change to CAC",
      icon: "📍",
    },
  ],
  CHANGE_OF_NAME: [
    {
      id: "special_resolution_name",
      name: "Special Resolution (Name Change)",
      description: "Special resolution approving new company name",
      icon: "⚖️",
    },
    {
      id: "board_resolution_name",
      name: "Board Resolution (Name Change)",
      description: "Board resolution approving name change",
      icon: "📝",
    },
    {
      id: "application_name_change",
      name: "Application for Name Change",
      description: "Formal application to CAC for name change",
      icon: "✏️",
    },
  ],
  INCREASE_SHARE_CAPITAL: [
    {
      id: "board_resolution_isc",
      name: "Board Resolution (Share Capital)",
      description: "Board resolution approving increase in share capital",
      icon: "⚖️",
    },
    {
      id: "special_resolution_isc",
      name: "Shareholders' Special Resolution",
      description: "Special resolution from shareholders",
      icon: "💹",
    },
    {
      id: "return_of_allotment",
      name: "Return of Allotment",
      description: "CAC Form for return of allotment of shares",
      icon: "📋",
    },
  ],
  AUDITED_ACCOUNTS: [
    {
      id: "directors_report_audit",
      name: "Director's Report",
      description: "Director's report accompanying audited accounts",
      icon: "📝",
    },
    {
      id: "auditors_report",
      name: "Auditor's Report",
      description: "Independent auditor's report",
      icon: "🔍",
    },
    {
      id: "financial_statements",
      name: "Financial Statements",
      description: "Balance sheet and income statement",
      icon: "📊",
    },
  ],
};

export const generateDocumentContent = (templateId, filing) => {
  const formData = filing.formData || {};
  const business = filing.business || {};
  const client = business.user || {};
  const today = new Date().toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const templates = {
    board_resolution_cod: `BOARD RESOLUTION OF ${business.businessName?.toUpperCase() || "[COMPANY NAME]"}
RC NUMBER: ${business.rcNumber || "[RC NUMBER]"}

MINUTES OF A MEETING OF THE BOARD OF DIRECTORS
Date: ${formData.boardResolutionDate ? new Date(formData.boardResolutionDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[DATE]"}
Venue: ${formData.registeredAddress || business.address || "[REGISTERED ADDRESS]"}

PRESENT:
${formData.director1Name || "[DIRECTOR 1 NAME]"} - Director
${formData.director2Name || "[DIRECTOR 2 NAME]"} - Director

IT WAS RESOLVED AS FOLLOWS:

${
  formData.changeType === "Appointment of New Director"
    ? `
APPOINTMENT OF NEW DIRECTOR
That ${formData.directorFullName || "[DIRECTOR NAME]"}, of ${formData.directorAddress || "[ADDRESS]"}, a ${formData.directorNationality || "Nigerian"} national, be and is hereby appointed as a Director of the Company with effect from ${formData.effectiveDate ? new Date(formData.effectiveDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[EFFECTIVE DATE]"}.

That the appointment of ${formData.directorFullName || "[DIRECTOR NAME]"} as Director be and is hereby ratified and confirmed.
`
    : ""
}

${
  formData.changeType === "Resignation of Director" ||
  formData.changeType === "Removal of Director"
    ? `
${formData.changeType?.toUpperCase()}
That the resignation/removal of ${formData.directorFullName || "[DIRECTOR NAME]"} as a Director of the Company with effect from ${formData.effectiveDate ? new Date(formData.effectiveDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[EFFECTIVE DATE]"} be and is hereby accepted and noted.

Reason: ${formData.reasonForChange || "[REASON FOR CHANGE]"}
`
    : ""
}

That the Company Secretary be and is hereby authorized to file the necessary forms with the Corporate Affairs Commission to effect the above change.

CERTIFIED AS A TRUE COPY OF THE RESOLUTION PASSED AT THE ABOVE MEETING

_______________________________          _______________________________
Director                                  Director/Secretary
${formData.director1Name || "[NAME]"}     ${formData.director2Name || "[NAME]"}
Date: ${today}`,

    consent_to_act: `CONSENT TO ACT AS DIRECTOR

I, ${formData.directorFullName || "[FULL NAME]"}, of ${formData.directorAddress || "[RESIDENTIAL ADDRESS]"}, do hereby consent to act as a Director of:

Company Name: ${business.businessName || "[COMPANY NAME]"}
RC Number: ${business.rcNumber || "[RC NUMBER]"}

I confirm that:
1. I am not disqualified from acting as a Director under the Companies and Allied Matters Act (CAMA) 2020
2. I am not an undischarged bankrupt
3. I have not been convicted of any offence involving fraud or dishonesty
4. I am above 18 years of age
5. I am not a body corporate

My details are as follows:
Full Name: ${formData.directorFullName || "[FULL NAME]"}
Date of Birth: ${formData.directorDOB ? new Date(formData.directorDOB).toLocaleDateString("en-NG") : "[DATE OF BIRTH]"}
Nationality: ${formData.directorNationality || "Nigerian"}
Occupation: ${formData.directorOccupation || "[OCCUPATION]"}
Residential Address: ${formData.directorAddress || "[ADDRESS]"}
Email: ${formData.directorEmail || "[EMAIL]"}
Phone: ${formData.directorPhone || "[PHONE]"}
NIN/BVN: ${formData.directorNIN || "[NIN/BVN]"}

Signed: _______________________________
Name: ${formData.directorFullName || "[FULL NAME]"}
Date: ${today}`,

    board_resolution_coa: `BOARD RESOLUTION OF ${business.businessName?.toUpperCase() || "[COMPANY NAME]"}
RC NUMBER: ${business.rcNumber || "[RC NUMBER]"}

MINUTES OF A MEETING OF THE BOARD OF DIRECTORS
Date: ${formData.boardResolutionDate ? new Date(formData.boardResolutionDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[DATE]"}

PRESENT:
${formData.director1Name || "[DIRECTOR 1 NAME]"} - Director
${formData.director2Name || "[DIRECTOR 2 NAME]"} - Director

IT WAS RESOLVED AS FOLLOWS:

CHANGE OF REGISTERED ADDRESS
That the registered address of the Company be changed from:
${formData.currentAddress || business.address || "[CURRENT ADDRESS]"}

To:
${formData.newAddress || "[NEW ADDRESS]"}
${formData.newLGA || "[LGA]"}, ${formData.newState || "[STATE]"}

With effect from: ${formData.effectiveDate ? new Date(formData.effectiveDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[EFFECTIVE DATE]"}

That the Company Secretary be and is hereby authorized to file the necessary forms with the Corporate Affairs Commission to effect the above change.

CERTIFIED AS A TRUE COPY OF THE RESOLUTION

_______________________________          _______________________________
Director                                  Director/Secretary
${formData.director1Name || "[NAME]"}     ${formData.director2Name || "[NAME]"}
Date: ${today}`,

    special_resolution_name: `SPECIAL RESOLUTION OF ${business.businessName?.toUpperCase() || "[COMPANY NAME]"}
RC NUMBER: ${business.rcNumber || "[RC NUMBER]"}

SPECIAL RESOLUTION PASSED AT AN EXTRAORDINARY GENERAL MEETING
Date: ${formData.generalMeetingDate ? new Date(formData.generalMeetingDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[DATE]"}
Venue: ${business.address || "[REGISTERED ADDRESS]"}

IT IS HEREBY RESOLVED AS A SPECIAL RESOLUTION THAT:

1. The name of the Company be changed from:
   "${formData.currentName || business.businessName || "[CURRENT NAME]"}"

   To:
   "${formData.proposedName1 || "[PROPOSED NEW NAME]"}"

2. Reason for name change: ${formData.reasonForChange || "[REASON FOR CHANGE]"}

3. That the Memorandum and Articles of Association of the Company be amended accordingly to reflect the change of name.

4. That the Directors and Company Secretary be and are hereby authorized to do all such acts, deeds and things as may be necessary to give effect to this resolution.

Signed on behalf of the Company:

_______________________________          _______________________________
Director                                  Director/Secretary
${formData.director1Name || "[NAME]"}     ${formData.director2Name || "[NAME]"}
Date: ${today}`,

    board_resolution_ar: `BOARD RESOLUTION OF ${business.businessName?.toUpperCase() || "[COMPANY NAME]"}
RC NUMBER: ${business.rcNumber || "[RC NUMBER]"}

RESOLUTION OF THE BOARD OF DIRECTORS
Date: ${today}

IT WAS RESOLVED THAT:

1. The Annual Returns of the Company for the year ended ${formData.financialYearEnd ? new Date(formData.financialYearEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[YEAR END DATE]"} be and are hereby approved.

2. The financial summary showing:
   Total Turnover: ₦${Number(formData.turnover || 0).toLocaleString()}
   Net Assets: ₦${Number(formData.netAssets || 0).toLocaleString()}
   Number of Employees: ${formData.numberOfEmployees || "[NUMBER]"}

   be and is hereby approved for filing with the Corporate Affairs Commission.

3. The Directors and Company Secretary be and are hereby authorized to file the Annual Returns with the Corporate Affairs Commission.

_______________________________
Director
${formData.director1Name || "[NAME]"}
Date: ${today}`,

    directors_report: `DIRECTOR'S REPORT
${business.businessName?.toUpperCase() || "[COMPANY NAME]"}
RC NUMBER: ${business.rcNumber || "[RC NUMBER]"}
FOR THE YEAR ENDED ${formData.financialYearEnd ? new Date(formData.financialYearEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[YEAR END DATE]"}

The Directors present their report together with the audited financial statements for the year ended ${formData.financialYearEnd ? new Date(formData.financialYearEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[YEAR END DATE]"}.

PRINCIPAL ACTIVITIES
The principal activities of the Company during the year were ${formData.natureOfBusiness || "[NATURE OF BUSINESS]"}.

FINANCIAL RESULTS
The results for the year are as follows:
Turnover: ₦${Number(formData.turnover || 0).toLocaleString()}
Net Assets: ₦${Number(formData.netAssets || 0).toLocaleString()}

DIRECTORS
The following persons were Directors of the Company during the year:
${formData.director1Name || "[DIRECTOR 1]"}
${formData.director2Name ? formData.director2Name : ""}
${formData.director3Name ? formData.director3Name : ""}

EMPLOYEES
The average number of employees during the year was ${formData.numberOfEmployees || "[NUMBER]"}.

REGISTERED ADDRESS
${formData.registeredAddress || business.address || "[REGISTERED ADDRESS]"}

By Order of the Board

_______________________________
Director
${formData.director1Name || "[NAME]"}
Date: ${today}`,

    board_resolution_isc: `BOARD RESOLUTION OF ${business.businessName?.toUpperCase() || "[COMPANY NAME]"}
RC NUMBER: ${business.rcNumber || "[RC NUMBER]"}

RESOLUTION OF THE BOARD OF DIRECTORS
Date: ${formData.boardResolutionDate ? new Date(formData.boardResolutionDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[DATE]"}

IT WAS RESOLVED THAT:

INCREASE IN SHARE CAPITAL

1. The authorised share capital of the Company be increased from:
   ₦${Number(formData.currentShareCapital || 0).toLocaleString()}

   To:
   ₦${Number(formData.newShareCapital || 0).toLocaleString()}

2. Reason for increase: ${formData.reasonForIncrease || "[REASON]"}

3. That the Directors be and are hereby authorized to take all necessary steps to effect this increase including filing the requisite forms with the Corporate Affairs Commission.

4. That the Memorandum of Association be amended to reflect the new share capital.

CERTIFIED AS A TRUE COPY OF THE RESOLUTION

_______________________________          _______________________________
Director                                  Director/Secretary
${formData.director1Name || "[NAME]"}     ${formData.director2Name || "[NAME]"}
Date: ${today}`,

    auditors_report: `INDEPENDENT AUDITOR'S REPORT
TO THE MEMBERS OF ${business.businessName?.toUpperCase() || "[COMPANY NAME]"}

REPORT ON THE FINANCIAL STATEMENTS

Opinion
We have audited the financial statements of ${business.businessName || "[COMPANY NAME]"} (RC: ${business.rcNumber || "[RC NUMBER]"}), which comprise the statement of financial position as at ${formData.financialYearEnd ? new Date(formData.financialYearEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "[YEAR END DATE]"}, and the statement of comprehensive income, statement of changes in equity and statement of cash flows for the year then ended.

In our opinion, the financial statements give a true and fair view of the financial position of the Company as at ${formData.financialYearEnd ? new Date(formData.financialYearEnd).toLocaleDateString("en-NG") : "[DATE]"}.

Key Financial Figures:
Total Assets: ₦${Number(formData.totalAssets || 0).toLocaleString()}
Total Liabilities: ₦${Number(formData.totalLiabilities || 0).toLocaleString()}
Net Profit/(Loss): ₦${Number(formData.netProfit || 0).toLocaleString()}
Turnover: ₦${Number(formData.turnover || 0).toLocaleString()}

Basis for Opinion
We conducted our audit in accordance with International Standards on Auditing (ISAs). Our responsibilities under those standards are further described in the Auditor's Responsibilities section of our report.

_______________________________
${formData.auditorName || "[AUDITOR NAME]"}
${formData.auditorFirm || "[AUDIT FIRM]"}
${formData.auditorAddress || "[AUDITOR ADDRESS]"}
Date: ${today}`,
  };

  return (
    templates[templateId] ||
    `Document template for ${templateId}\n\nPlease customize this document with the client's information.\n\nClient: ${client.fullName || "[CLIENT NAME]"}\nBusiness: ${business.businessName || "[BUSINESS NAME]"}\nRC Number: ${business.rcNumber || "[RC NUMBER]"}`
  );
};
