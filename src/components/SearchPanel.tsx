import { useState } from 'react';
import type { SearchProviderKind } from '../types/config';
import type { ParcelResult } from '../types/parcel';

interface SearchPanelProps {
  onSearch: (parcelId: string) => Promise<ParcelResult[]>;
  onSelectResult: (result: ParcelResult) => void;
  provider: SearchProviderKind;
  results: ParcelResult[];
  status: 'idle' | 'loading' | 'success' | 'error';
  lastQuery: string;
  searching: boolean;
  error: string | null;
}

const providerLabels: Record<SearchProviderKind, string> = {
  mock: 'Mock service',
  ogcApiFeatures: 'OGC API Features',
  wfs: 'WFS'
};

const SearchPanel = ({ onSearch, onSelectResult, provider, results, status, lastQuery, searching, error }: SearchPanelProps) => {
  const [parcelId, setParcelId] = useState('');

  return (
    <section className="sidebar-card">
      <div className="section-header">
        <h3>Parcel Search</h3>
        <span>{providerLabels[provider]}</span>
      </div>
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSearch(parcelId.trim());
        }}
      >
        <input
          type="text"
          placeholder="Parcel ID"
          value={parcelId}
          onChange={(event) => setParcelId(event.target.value)}
        />
        <button type="submit" className="primary-action" disabled={searching || !parcelId.trim()}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {status === 'loading' ? <p className="helper-text">Querying the parcel index...</p> : null}
      {error ? <p className="status-banner error">{error}</p> : null}
      {status === 'success' && !error && lastQuery && results.length === 0 ? (
        <p className="helper-text">No parcels found for "{lastQuery}".</p>
      ) : null}
      {results.length > 0 ? (
        <div className="search-results">
          <p className="helper-text">
            {results.length} match{results.length === 1 ? '' : 'es'} found. The map zoomed to the first result.
          </p>
          <ul>
            {results.map((result) => (
              <li key={`${result.source}-${result.id}`}>
                <button type="button" className="result-card" onClick={() => onSelectResult(result)}>
                  <strong>{result.title}</strong>
                  <span>{result.subtitle ?? 'No address provided'}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};

export default SearchPanel;
