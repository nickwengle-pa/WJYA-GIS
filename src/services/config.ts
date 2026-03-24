import type { AppConfig } from '../types/config';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCenter = (value: string | undefined): [number, number] => {
  if (!value) {
    return [-104.9903, 39.7392];
  }

  const [lonText, latText] = value.split(',').map((part) => part.trim());
  const lon = Number(lonText);
  const lat = Number(latText);

  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    return [-104.9903, 39.7392];
  }

  return [lon, lat];
};

const getEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return String(value);
};

export const appConfig: AppConfig = {
  qgisBaseUrl: getEnv('VITE_QGIS_BASE_URL'),
  qgisProjectName: getEnv('VITE_QGIS_PROJECT_NAME'),
  parcelLayerName: getEnv('VITE_PARCEL_LAYER_NAME'),
  parcelLabelLayerName: getEnv('VITE_PARCEL_LABEL_LAYER_NAME'),
  externalWmsUrl: import.meta.env.VITE_EXTERNAL_WMS_URL,
  externalWmsLayerName: import.meta.env.VITE_EXTERNAL_WMS_LAYER_NAME,
  printLayoutName: getEnv('VITE_PRINT_LAYOUT_NAME', 'Tax_11x17_Landscape'),
  initialCenter: parseCenter(import.meta.env.VITE_INITIAL_CENTER),
  initialZoom: parseNumber(import.meta.env.VITE_INITIAL_ZOOM, 13),
  searchableParcelField: getEnv('VITE_SEARCHABLE_PARCEL_FIELD', 'parcel_id'),
  identifyFields: getEnv('VITE_IDENTIFY_FIELDS', 'parcel_id,owner_name,site_address,acreage')
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean),
  searchEndpointUrl: import.meta.env.VITE_SEARCH_ENDPOINT_URL,
  projection: getEnv('VITE_MAP_PROJECTION', 'EPSG:3857')
};
