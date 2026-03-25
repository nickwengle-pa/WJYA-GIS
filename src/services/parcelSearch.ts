import type { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import type { AppConfig } from '../types/config';
import type { ParcelResult } from '../types/parcel';
import type { OgcApiFeaturesResponse } from '../types/qgis';
import { appendQueryParams } from '../utils/url';

const format = new GeoJSON();

const mockFallbackResults = (parcelId: string): ParcelResult[] => [
  {
    id: `mock-${parcelId}`,
    attributes: {
      parcel_id: parcelId,
      owner_name: 'Mock Owner',
      site_address: '100 Mockingbird Ln'
    }
  }
];

const toParcelResult = (feature: OgcApiFeaturesResponse['features'][number], config: AppConfig): ParcelResult => {
  const parcelId = String(feature.properties[config.searchableParcelField] ?? feature.id ?? 'unknown');

  return {
    id: parcelId,
    attributes: Object.fromEntries(
      Object.entries(feature.properties).map(([key, value]) => [key, typeof value === 'string' || typeof value === 'number' ? value : null])
    ),
    geometry: feature.geometry
      ? format.readGeometry(feature.geometry, { featureProjection: 'EPSG:3857' }) ?? undefined
      : undefined,
    bbox: feature.bbox
  };
};

export const searchParcels = async (parcelId: string, config: AppConfig): Promise<ParcelResult[]> => {
  if (!config.searchEndpointUrl) {
    return mockFallbackResults(parcelId);
  }

  const endpoint = appendQueryParams(config.searchEndpointUrl, {
    limit: 5,
    filter: `${config.searchableParcelField}='${parcelId.replace(/'/g, "''")}'`
  });

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as OgcApiFeaturesResponse;

  return payload.features.map((feature) => toParcelResult(feature, config));
};

export const getFeatureExtent = (feature: FeatureLike): [number, number, number, number] | null => {
  const geometry = feature.getGeometry();
  return geometry ? (geometry.getExtent() as [number, number, number, number]) : null;
};
