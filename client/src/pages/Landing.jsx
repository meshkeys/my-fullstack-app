import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Landing() {
  const navigate = useNavigate();
  const [rcNumber, setRcNumber] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for RC Number: ${rcNumber}`);
    // We'll connect this to CAC API later
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
            Check Your Company Status
          </h2>
          <p className="mt-2 text-gray-500">
            Enter your RC Number to check your CAC compliance status
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={rcNumber}
              onChange={(e) => setRcNumber(e.target.value)}
              placeholder="Enter RC Number e.g RC1234567"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Check Status
            </button>
          </form>
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
