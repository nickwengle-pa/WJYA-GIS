import { useState } from 'react';
import { fromExtent } from 'ol/geom/Polygon';
import type Map from 'ol/Map';
import Feature from 'ol/Feature';
import type { AppConfig } from '../types/config';
import type { ParcelResult } from '../types/parcel';
import { searchParcels } from '../services/parcelSearch';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export const useParcelSearch = (map: Map | null, config: AppConfig) => {
  const [results, setResults] = useState<ParcelResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const zoomToResult = (result: ParcelResult) => {
    if (!map) {
      return;
    }

    const geometry = result.geometry ?? (result.bbox ? fromExtent(result.bbox) : undefined);
    if (!geometry) {
      return;
    }

    const feature = new Feature(geometry);
    map.getView().fit(feature.getGeometry()!.getExtent(), {
      padding: [40, 40, 40, 40],
      duration: 400,
      maxZoom: 19
    });
  };

  const runSearch = async (parcelId: string): Promise<ParcelResult[]> => {
    const normalizedParcelId = parcelId.trim();
    setLastQuery(normalizedParcelId);

    if (!normalizedParcelId) {
      setResults([]);
      setStatus('idle');
      setError(null);
      return [];
    }

    setStatus('loading');
    setError(null);

    try {
      const found = await searchParcels(normalizedParcelId, config);
      setResults(found);
      setStatus('success');

      if (found[0]) {
        zoomToResult(found[0]);
      }

      return found;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unknown search error';
      setResults([]);
      setStatus('error');
      setError(message);
      return [];
    }
  };

  return {
    results,
    searching: status === 'loading',
    status,
    error,
    lastQuery,
    runSearch,
    zoomToResult
  };
};
