import { createLayerRegistry } from './layerRegistry';
import type { AppConfig, PopupFieldConfig, SearchConfig, SearchProviderKind } from '../types/config';

const defaultCenter: [number, number] = [-104.9903, 39.7392];

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCenter = (value: string | undefined): [number, number] => {
  if (!value) {
    return defaultCenter;
  }

  const [lonText, latText] = value.split(',').map((part) => part.trim());
  const lon = Number(lonText);
  const lat = Number(latText);

  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    return defaultCenter;
  }

  return [lon, lat];
};

const getOptionalEnv = (key: string): string | undefined => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    return undefined;
  }

  return String(value);
};

const getEnv = (key: string, fallback?: string): string => {
  const value = getOptionalEnv(key);
  if (value !== undefined) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
};

const parseSearchProvider = (value: string | undefined, hasSearchUrl: boolean): SearchProviderKind => {
  if (value === 'mock' || value === 'ogcApiFeatures' || value === 'wfs') {
    return value;
  }

  return hasSearchUrl ? 'ogcApiFeatures' : 'mock';
};

const buildSearchConfig = (parcelIdField: string, projection: string): SearchConfig => {
  const searchUrl = getOptionalEnv('VITE_SEARCH_URL');
  const provider = parseSearchProvider(getOptionalEnv('VITE_SEARCH_PROVIDER'), Boolean(searchUrl));
  const maxResults = parseNumber(getOptionalEnv('VITE_SEARCH_MAX_RESULTS'), 5);
  const commonFields = {
    parcelIdField,
    maxResults,
    resultSubtitleField: 'site_address'
  };

  if (provider === 'wfs') {
    return {
      kind: 'wfs',
      url: getEnv('VITE_SEARCH_URL'),
      typeName: getEnv('VITE_SEARCH_TYPENAME'),
      version: getEnv('VITE_SEARCH_WFS_VERSION', '1.1.0'),
      outputFormat: getEnv('VITE_SEARCH_WFS_OUTPUT_FORMAT', 'application/json'),
      srsName: getEnv('VITE_SEARCH_WFS_SRS_NAME', projection),
      ...commonFields
    };
  }

  if (provider === 'ogcApiFeatures') {
    return {
      kind: 'ogcApiFeatures',
      url: getEnv('VITE_SEARCH_URL'),
      ...commonFields
    };
  }

  return {
    kind: 'mock',
    ...commonFields
  };
};

const searchableParcelField = getEnv('VITE_SEARCHABLE_PARCEL_FIELD', 'parcel_id');
const popupFields: PopupFieldConfig[] = [
  // Replace these with the exact parcel fields exposed by your QGIS project.
  { field: searchableParcelField, label: 'Parcel ID' },
  { field: 'owner_name', label: 'Owner' },
  { field: 'site_address', label: 'Site Address' },
  { field: 'land_use', label: 'Land Use' },
  { field: 'acreage', label: 'Acres', format: 'acreage' }
];

const projection = getEnv('VITE_MAP_PROJECTION', 'EPSG:3857');
const layerRegistry = createLayerRegistry({
  parcelLayerName: getEnv('VITE_PARCEL_LAYER_NAME'),
  parcelLabelLayerName: getEnv('VITE_PARCEL_LABEL_LAYER_NAME'),
  externalWmsUrl: getOptionalEnv('VITE_EXTERNAL_WMS_URL'),
  externalWmsLayerName: getOptionalEnv('VITE_EXTERNAL_WMS_LAYER_NAME')
});

export const appConfig: AppConfig = {
  appTitle: 'County Parcel Viewer',
  appSubtitle: 'Parcel search, identify, and print tools backed by QGIS Server.',
  qgisBaseUrl: getEnv('VITE_QGIS_BASE_URL'),
  qgisProjectName: getEnv('VITE_QGIS_PROJECT_NAME'),
  printLayoutName: getEnv('VITE_PRINT_LAYOUT_NAME', 'CountyParcel_11x17'),
  initialCenter: parseCenter(getOptionalEnv('VITE_INITIAL_CENTER')),
  initialZoom: parseNumber(getOptionalEnv('VITE_INITIAL_ZOOM'), 13),
  projection,
  defaultBasemapId: 'street',
  basemaps: layerRegistry.basemaps,
  operationalLayers: layerRegistry.operationalLayers,
  identifyLayerId: 'parcel-fill',
  popup: {
    titleField: searchableParcelField,
    emptyValueText: 'Not available',
    fields: popupFields
  },
  search: buildSearchConfig(searchableParcelField, projection)
};
