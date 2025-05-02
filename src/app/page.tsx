
'use client';

import { useState } from 'react';

// Define the structure of the rebuilt content we expect from the API
type RebuiltProposal = {
  html?: string;
  suggestions?: string[];
  error?: string;
};

// Define the structure of the API response
type ApiResponse = {
  message?: string;
  error?: string;
  rebuiltContent?: RebuiltProposal;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rebuiltData, setRebuiltData] = useState<RebuiltProposal | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRebuiltData(null);
    console.log('Submitting URL:', url);

    try {
      const response = await fetch('/api/rebuild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      // Use the specific ApiResponse type
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Received data:', data);
      // Ensure rebuiltContent exists before setting
      setRebuiltData(data.rebuiltContent || null);

    } catch (err: unknown) { // Use unknown instead of any
      console.error('Failed to rebuild site:', err);
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ padding: '3rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1>🛠️ AI Website Rebuilder</h1>
      <p>Paste an outdated website URL below, and we’ll attempt to rebuild it smarter, faster, and SEO-optimized using AI.</p>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={isLoading}
          style={{ padding: '0.5rem', width: 'calc(100% - 120px)', marginRight: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '0.5rem 1rem', cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none', background: '#0070f3', color: 'white', borderRadius: '4px' }}>
          {isLoading ? 'Rebuilding...' : 'Rebuild Site'}
        </button>
      </form>

      {isLoading && (
        <p>Scraping website and consulting AI... Please wait.</p>
      )}

      {error && (
        <div style={{ marginTop: '1rem', color: 'red', border: '1px solid red', padding: '1rem', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {rebuiltData && (
        <div style={{ marginTop: '2rem', border: '1px solid #eee', padding: '1rem', borderRadius: '4px' }}>
          <h2>Rebuilt Proposal for {url}</h2>
          {rebuiltData.error ? (
            <p style={{ color: 'orange' }}>AI Error: {rebuiltData.error}</p>
          ) : (
            <>
              {rebuiltData.suggestions && rebuiltData.suggestions.length > 0 && (
                <div style={{ marginBottom: '1rem', background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong>Suggestions:</strong>
                  <ul>
                    {rebuiltData.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              {rebuiltData.html ? (
                <div>
                  <strong>Generated HTML Preview:</strong>
                  {/* WARNING: Rendering arbitrary HTML is dangerous. Sanitize or use iframe for safety. */}
                  {/* For now, displaying as preformatted text for safety */}
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#fafafa', padding: '1rem', border: '1px solid #ddd', maxHeight: '400px', overflowY: 'auto' }}>
                    {rebuiltData.html}
                  </pre>
                  {/* Alternative (safer) using iframe:
                  <iframe
                    srcDoc={rebuiltData.html} 
                    style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
                    sandbox="allow-same-origin" // Restrict iframe capabilities
                    title="Rebuilt HTML Preview"
                  />
                  */}
                </div>
              ) : (
                <p>No HTML content was generated.</p>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}

