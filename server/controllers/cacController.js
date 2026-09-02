const { ApifyClient } = require("apify-client");

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

    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    // Run the CAC lookup actor
    const run = await client.actor("mansalabs/cac-company-lookup").call({
      searchTerms: [query],
      maxResults: 10,
    });

    // Fetch results from dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log("Apify results:", JSON.stringify(items).substring(0, 300));

    const results = items.map((company) => {
      console.log("Company raw data:", JSON.stringify(company));
      return {
        name: company.company_name || company.approvedName || "",
        rcNumber: company.rc_number || company.registrationNumber || "",
        type: company.entity_type || company.classificationLabel || "",
        status: company.status || "ACTIVE",
        registrationDate:
          company.incorporation_date || company.registrationDate || "",
        natureOfBusiness: company.nature_of_business || "",
      };
    });

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
