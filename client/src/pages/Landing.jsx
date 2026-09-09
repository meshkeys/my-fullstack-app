import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResults(null);
    if (!query.trim()) return;
    try {
      setSearching(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cac/search?query=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data);
    } catch {
      setSearchError('Unable to reach CAC portal. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ fontFamily: "-apple-system, 'Inter', sans-serif", background: '#fff', color: '#0a1628', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 32px', borderBottom: '1px solid #e8ede8', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: '#0f5c2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>CF</span>
          </div>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0a1628', letterSpacing: '-0.3px' }}>
            CAC<span style={{ color: '#0f5c2e' }}>Filing</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #d1dbd1', fontSize: '13px', fontWeight: '600', color: '#0a1628', background: 'transparent', cursor: 'pointer' }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', color: '#fff', background: '#0f5c2e', cursor: 'pointer' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '72px 32px 56px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: '#e8f5ee', color: '#0f5c2e', fontSize: '12px', fontWeight: '700', letterSpacing: '0.4px', marginBottom: '28px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0f5c2e' }} />
          🇳🇬 Built for Nigerian Business Owners
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-2px', color: '#0a1628', marginBottom: '20px' }}>
          Keep Your Business<br />
          <span style={{ color: '#0f5c2e' }}>CAC Compliant</span>
        </h1>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: '1.65', marginBottom: '36px', maxWidth: '500px', margin: '0 auto 36px' }}>
          Expert-handled CAC filings. We prepare your documents, submit to CAC, and keep you compliant — so you can focus on your business.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ padding: '15px 32px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '700', color: '#fff', background: '#0f5c2e', cursor: 'pointer', letterSpacing: '-0.2px' }}
          >
            Start Filing Today →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '15px 32px', borderRadius: '10px', border: '1.5px solid #d1dbd1', fontSize: '15px', fontWeight: '600', color: '#0a1628', background: '#fff', cursor: 'pointer' }}
          >
            Login to Dashboard
          </button>
        </div>
      </section>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #e8ede8', borderBottom: '1px solid #e8ede8' }}>
        {[
          { num: '100K+', label: 'Businesses at risk of CAC closure' },
          { num: '<1hr', label: 'Response time guarantee' },
          { num: '100%', label: 'CAC-compliant filings' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '28px 24px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e8ede8' : 'none' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: '#0f5c2e', letterSpacing: '-1px', marginBottom: '4px' }}>{s.num}</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CAC Search */}
      <section style={{ background: '#f8faf8', padding: '48px 32px', borderBottom: '1px solid #e8ede8' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f5c2e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Company Lookup
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0a1628', letterSpacing: '-0.8px', marginBottom: '6px' }}>
            Check Your CAC Status
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Enter your company name or RC Number to instantly verify your CAC compliance status
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Company name or RC Number e.g RC1234567"
              style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #d1dbd1', borderRadius: '10px', fontSize: '14px', color: '#0a1628', background: '#fff', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{ padding: '12px 22px', background: '#0f5c2e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', opacity: searching ? 0.7 : 1 }}
            >
              {searching ? 'Searching...' : 'Check Status'}
            </button>
          </form>

          {searchError && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>
              {searchError}
            </div>
          )}

          {searchResults && (
            <div style={{ marginTop: '16px' }}>
              {searchResults.fallbackUrl ? (
                <div style={{ padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                    🔍 Search directly on the CAC portal
                  </p>
                  <a
                    href={searchResults.fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', padding: '8px 20px', background: '#0f5c2e', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Search on CAC Portal →
                  </a>
                </div>
              ) : searchResults.results?.length === 0 ? (
                <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>No results found for "{searchResults.query}"</p>
                  <a
                    href={`https://search.cac.gov.ng/home/searching?q=${encodeURIComponent(searchResults.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: '#0f5c2e', fontWeight: '600' }}
                  >
                    Try on CAC Portal →
                  </a>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    {searchResults.results?.length} result(s) for "{searchResults.query}"
                  </p>
                  {searchResults.results?.map((company, i) => (
                    <div key={i} style={{ padding: '14px 16px', background: '#fff', border: '1px solid #e8ede8', borderRadius: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '14px', color: '#0a1628' }}>{company.name}</p>
                          {company.rcNumber && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>RC: {company.rcNumber}</p>}
                          {company.type && <p style={{ fontSize: '12px', color: '#64748b' }}>Type: {company.type}</p>}
                        </div>
                        {company.status && (
                          <span style={{ padding: '3px 10px', borderRadius: '100px', background: company.status.toLowerCase().includes('active') ? '#e8f5ee' : '#fef2f2', color: company.status.toLowerCase().includes('active') ? '#0f5c2e' : '#dc2626', fontSize: '11px', fontWeight: '700' }}>
                            {company.status}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f1', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate('/register')}
                          style={{ padding: '6px 12px', background: '#0f5c2e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          File for this company →
                        </button>
                        <a
                          href={`https://search.cac.gov.ng/home/searching?q=${encodeURIComponent(company.rcNumber || company.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '6px 12px', border: '1px solid #d1dbd1', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#0a1628', textDecoration: 'none' }}
                        >
                          View on CAC
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

      {/* Features */}
      <section style={{ padding: '56px 32px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f5c2e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Why Choose Us
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#0a1628', letterSpacing: '-1px' }}>
            Everything handled by experts
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { icon: '📋', title: 'Guided intake forms', desc: 'Just answer simple questions — our legal team prepares all your CAC documents' },
            { icon: '⚡', title: '1-hour response', desc: 'Our legal agents review and respond to every filing within one business hour' },
            { icon: '🔔', title: 'Deadline reminders', desc: 'Receive email and SMS alerts well before your CAC filing deadlines' },
            { icon: '📊', title: 'Compliance tracking', desc: 'Real-time dashboard showing compliance status for all your businesses' },
            { icon: '💬', title: 'Direct agent messaging', desc: 'Communicate with your assigned legal agent directly through the app' },
            { icon: '🔒', title: 'Secure document handling', desc: 'All your documents are encrypted and stored securely in the cloud' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#f8faf8', border: '1px solid #e8ede8', borderRadius: '12px', padding: '20px' }}>
              <div style={{ width: '38px', height: '38px', background: '#e8f5ee', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>
                {f.icon}
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#0a1628', marginBottom: '4px' }}>{f.title}</p>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#0a1628', padding: '56px 32px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            How it works
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.8px', marginBottom: '40px' }}>
            Filing in 3 simple steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { num: '01', title: 'Fill the form', desc: 'Answer simple questions about your business and what you want to file' },
              { num: '02', title: 'Agent reviews', desc: 'Our legal team prepares all required CAC documents within 1 hour' },
              { num: '03', title: 'CAC submission', desc: 'We submit to CAC on your behalf and send you confirmation' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80', letterSpacing: '-1px', marginBottom: '10px' }}>{s.num}</div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>{s.title}</p>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{ marginTop: '40px', padding: '15px 36px', background: '#0f5c2e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
          >
            Get Started For Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#060d18', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          CAC<span style={{ color: '#4ade80' }}>Filing</span>
        </div>
        <p style={{ fontSize: '12px', color: '#334155' }}>
          Helping Nigerian businesses stay compliant © 2024 · All rights reserved
        </p>
      </footer>

    </div>
  );
}

export default Landing;