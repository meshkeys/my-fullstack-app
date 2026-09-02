import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Landing() {
  const navigate = useNavigate();
  const [rcNumber, setRcNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError("");
    setSearchResults(null);

    if (!rcNumber.trim()) return;

    try {
      setSearching(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cac/search?query=${encodeURIComponent(rcNumber)}`,
      );
      setSearchResults(response.data);
    } catch {
      setSearchError("Unable to reach CAC portal. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-800">CAC</span>
          <span className="text-2xl font-semibold text-green-600">Filing</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-green-800 font-medium border border-green-800 rounded-lg hover:bg-green-50 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 bg-green-800 text-white font-medium rounded-lg hover:bg-green-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto">
        <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-1 rounded-full">
          🇳🇬 Built for Nigerian Business Owners
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold text-green-900 leading-tight">
          Keep Your Business <br />
          <span className="text-green-600">CAC Compliant</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Never miss a CAC filing deadline again. We help business owners stay
          compliant, submit filings easily, and avoid business closure.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-4 bg-green-800 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition shadow-lg"
          >
            Start For Free →
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-white text-green-800 text-lg font-semibold rounded-xl hover:bg-green-50 transition shadow border border-green-200"
          >
            Login to Dashboard
          </button>
        </div>
      </section>

      {/* Company Status Checker */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-green-900">
            🔍 Check Your Company CAC Status
          </h2>
          <p className="mt-2 text-gray-500">
            Enter your company name or RC Number to instantly verify your CAC
            status
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={rcNumber}
              onChange={(e) => setRcNumber(e.target.value)}
              placeholder="Enter company name or RC Number e.g RC1234567"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
            >
              {searching ? "Searching..." : "Check Status"}
            </button>
          </form>

          {/* Search Error */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {searchError}
            </div>
          )}

          {/* Search Results */}
          {searchResults && (
            <div className="mt-6 text-left">
              {searchResults.fallbackUrl ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <p className="text-blue-800 font-medium">
                    🔍 Search on CAC Portal directly
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Click below to search for "{searchResults.query}" on the
                    official CAC portal
                  </p>
                  <a
                    href={searchResults.fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block px-6 py-2 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                  >
                    Search on CAC Portal →
                  </a>
                </div>
              ) : searchResults.results.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <p className="text-yellow-800 font-medium">
                    No results found for "{searchResults.query}"
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Try searching with a different name or RC number
                  </p>
                  <a
                    href={`https://search.cac.gov.ng/home/searching?q=${encodeURIComponent(searchResults.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block px-4 py-2 border border-green-800 text-green-800 rounded-lg text-sm hover:bg-green-50 transition"
                  >
                    Try on CAC Portal →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">
                    Found {searchResults.results.length} result(s) for "
                    {searchResults.query}"
                  </p>
                  {searchResults.results.map((company, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">
                            {company.name}
                          </p>
                          {company.rcNumber && (
                            <p className="text-sm text-gray-500 mt-1">
                              RC: {company.rcNumber}
                            </p>
                          )}
                          {company.type && (
                            <p className="text-sm text-gray-500">
                              Type: {company.type}
                            </p>
                          )}
                          {company.registrationDate && (
                            <p className="text-sm text-gray-500">
                              Registered:{" "}
                              {new Date(
                                company.registrationDate,
                              ).toLocaleDateString("en-NG")}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold ${
                            company.status?.toLowerCase().includes("active")
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {company.status || "Unknown"}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                        <button
                          onClick={() => navigate("/register")}
                          className="text-xs px-3 py-1 bg-green-800 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          File for this company →
                        </button>
                        <a
                          href={`https://search.cac.gov.ng/home/searching?q=${encodeURIComponent(company.rcNumber || company.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 border border-green-800 text-green-800 rounded-lg hover:bg-green-50 transition"
                        >
                          View on CAC →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-green-900 mb-12">
          Why Choose CAC Filing?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "⚡",
              title: "Fast & Easy",
              description:
                "Fill your CAC forms in minutes with our step by step guided wizard",
            },
            {
              icon: "🔔",
              title: "Never Miss a Deadline",
              description:
                "Get email and SMS reminders before your filing deadlines",
            },
            {
              icon: "✅",
              title: "1 Hour Response",
              description:
                "Submit your filing and get a response from our team within 1 hour",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-green-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-500 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white text-center py-6 px-6">
        <p className="text-sm text-green-300">
          © 2024 CAC Filing. Helping Nigerian businesses stay compliant.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
