import GeoJSON from 'ol/format/GeoJSON';
import type { AppConfig, SearchConfig } from '../types/config';
import type { ParcelResult } from '../types/parcel';
import type { GeoJsonFeatureCollectionResponse, GeoJsonFeatureRecord } from '../types/qgis';
import { appendQueryParams } from '../utils/url';

const format = new GeoJSON();

const mockFallbackResults = (parcelId: string): ParcelResult[] => [
  {
    id: `mock-${parcelId}`,
    title: parcelId,
    subtitle: '100 Mockingbird Ln',
    attributes: {
      parcel_id: parcelId,
      owner_name: 'Mock Owner',
      site_address: '100 Mockingbird Ln'
    },
    source: 'mock'
  }
];

const toAttributeValue = (value: unknown): string | number | null =>
  typeof value === 'string' || typeof value === 'number' ? value : null;

const escapeFilterLiteral = (value: string): string => value.replace(/'/g, "''");

const buildSearchUrl = (parcelId: string, config: AppConfig): string => {
  const { search } = config;

  if (search.kind === 'ogcApiFeatures') {
    return appendQueryParams(search.url, {
      limit: search.maxResults,
      filter: `${search.parcelIdField}='${escapeFilterLiteral(parcelId)}'`
    });
  }

  if (search.kind === 'wfs') {
    return appendQueryParams(search.url, {
      service: 'WFS',
      version: search.version,
      request: 'GetFeature',
      MAP: config.qgisProjectName,
      TYPENAME: search.typeName,
      outputFormat: search.outputFormat,
      SRSNAME: search.srsName,
      MAXFEATURES: search.maxResults,
      EXP_FILTER: `"${search.parcelIdField}"='${escapeFilterLiteral(parcelId)}'`
    });
  }

  throw new Error('Mock search does not build a network request.');
};

const toParcelResult = (feature: GeoJsonFeatureRecord, search: SearchConfig): ParcelResult => {
  const parcelId = String(feature.properties[search.parcelIdField] ?? feature.id ?? 'unknown');
  const subtitleValue = search.resultSubtitleField ? toAttributeValue(feature.properties[search.resultSubtitleField]) : null;

  return {
    id: parcelId,
    title: parcelId,
    subtitle: subtitleValue ? String(subtitleValue) : undefined,
    attributes: Object.fromEntries(
      Object.entries(feature.properties).map(([key, value]) => [key, toAttributeValue(value)])
    ),
    geometry: feature.geometry
      ? format.readGeometry(feature.geometry, { featureProjection: 'EPSG:3857' }) ?? undefined
      : undefined,
    bbox: feature.bbox,
    source: search.kind
  };
};

export const searchParcels = async (parcelId: string, config: AppConfig): Promise<ParcelResult[]> => {
  if (config.search.kind === 'mock') {
    return mockFallbackResults(parcelId);
  }

  const response = await fetch(buildSearchUrl(parcelId, config));

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as GeoJsonFeatureCollectionResponse;
  if (!Array.isArray(payload.features)) {
    throw new Error('Search service returned an unexpected response shape.');
  }

  return payload.features.map((feature) => toParcelResult(feature, config.search));
};
