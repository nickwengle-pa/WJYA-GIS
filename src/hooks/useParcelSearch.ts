import { useState } from 'react';
import { fromExtent } from 'ol/geom/Polygon';
import type Map from 'ol/Map';
import Feature from 'ol/Feature';
import type { AppConfig } from '../types/config';
import type { ParcelResult } from '../types/parcel';
import { searchParcels } from '../services/parcelSearch';

export const useParcelSearch = (map: Map | null, config: AppConfig) => {
  const [results, setResults] = useState<ParcelResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (parcelId: string): Promise<ParcelResult[]> => {
    if (!parcelId) {
      setResults([]);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const found = await searchParcels(parcelId, config);
      setResults(found);

      const first = found[0];
      if (map && first) {
        const geometry = first.geometry ?? (first.bbox ? fromExtent(first.bbox) : undefined);
        if (geometry) {
          const feature = new Feature(geometry);
          map.getView().fit(feature.getGeometry()!.getExtent(), {
            padding: [30, 30, 30, 30],
            duration: 400,
            maxZoom: 19
          });
        }
      }

      return found;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unknown search error';
      setError(message);
      return [];
    } finally {
      setSearching(false);
    }
  };

  return {
    results,
    searching,
    error,
    runSearch
  };
};
