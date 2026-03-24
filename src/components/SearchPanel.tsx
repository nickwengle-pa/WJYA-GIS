import { useState } from 'react';
import type { ParcelResult } from '../types/parcel';

interface SearchPanelProps {
  onSearch: (parcelId: string) => Promise<ParcelResult[]>;
  searching: boolean;
  error: string | null;
}

const SearchPanel = ({ onSearch, searching, error }: SearchPanelProps) => {
  const [parcelId, setParcelId] = useState('');

  return (
    <section className="panel-section">
      <h3>Parcel Search</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSearch(parcelId.trim());
        }}
      >
        <input
          type="text"
          placeholder="Enter parcel ID"
          value={parcelId}
          onChange={(event) => setParcelId(event.target.value)}
        />
        <button type="submit" disabled={searching || !parcelId.trim()}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
};

export default SearchPanel;
