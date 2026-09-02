const axios = require("axios");
const cheerio = require("cheerio");

// @desc    Search CAC for company details
// @route   GET /api/cac/search?query=RC1234567
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

    // Make request to CAC search portal
    const response = await axios.get(
      `https://search.cac.gov.ng/home/searching?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        timeout: 15000,
      },
    );

    // Parse HTML response
    const $ = cheerio.load(response.data);
    const results = [];

    // Extract company results from CAC page
    $("table tbody tr").each((i, row) => {
      const cells = $(row).find("td");
      if (cells.length > 0) {
        results.push({
          name: $(cells[0]).text().trim(),
          rcNumber: $(cells[1]).text().trim(),
          type: $(cells[2]).text().trim(),
          status: $(cells[3]).text().trim(),
        });
      }
    });

    // If no table results, try other selectors
    if (results.length === 0) {
      $(".search-result, .company-result, .result-item").each((i, el) => {
        results.push({
          name: $(el).find(".name, h3, h4").text().trim(),
          rcNumber: $(el).find(".rc, .rc-number").text().trim(),
          type: $(el).find(".type").text().trim(),
          status: $(el).find(".status").text().trim(),
        });
      });
    }

    res.status(200).json({
      success: true,
      query,
      results,
      rawHtml: results.length === 0 ? response.data.substring(0, 2000) : null,
    });
  } catch (error) {
    console.error("CAC search error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to reach CAC portal. Please try again.",
      error: error.message,
    });
  }
};

module.exports = { searchCAC };
