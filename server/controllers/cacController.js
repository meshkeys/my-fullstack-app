const axios = require("axios");

const searchCAC = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a company name or RC number",
      });
    }

    console.log("Searching CAC for:", query);

    const response = await axios.get(
      `https://business-and-company-name-api.p.rapidapi.com/search`,
      {
        params: { q: query },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "business-and-company-name-api.p.rapidapi.com",
        },
        timeout: 15000,
      },
    );

    console.log(
      "CAC Response:",
      JSON.stringify(response.data).substring(0, 200),
    );

    const data = response.data;
    const results = [];

    // Parse results
    if (Array.isArray(data)) {
      data.forEach((company) => {
        results.push({
          name: company.companyName || company.name || "",
          rcNumber: company.registrationNumber || company.rcNumber || "",
          type: company.companyType || company.type || "",
          status: company.status || "ACTIVE",
          registrationDate: company.registrationDate || "",
          natureOfBusiness: company.natureOfBusiness || "",
        });
      });
    } else if (data.data && Array.isArray(data.data)) {
      data.data.forEach((company) => {
        results.push({
          name: company.companyName || company.name || "",
          rcNumber: company.registrationNumber || company.rcNumber || "",
          type: company.companyType || company.type || "",
          status: company.status || "ACTIVE",
          registrationDate: company.registrationDate || "",
          natureOfBusiness: company.natureOfBusiness || "",
        });
      });
    }

    res.status(200).json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error("CAC search error:", error.message);
    res.status(200).json({
      success: true,
      query: req.query.query,
      results: [],
      fallbackUrl: `https://icrp.cac.gov.ng/public-search?q=${encodeURIComponent(req.query.query)}`,
      message: "Search on CAC portal directly",
    });
  }
};

module.exports = { searchCAC };
