export const basemapIds = ['street', 'imagery'] as const;
export type BasemapId = (typeof basemapIds)[number];

export const operationalLayerIds = ['parcel-fill', 'parcel-labels', 'aerial-overlay', 'zoning-overlay'] as const;
export type OperationalLayerId = (typeof operationalLayerIds)[number];

export type PopupFieldFormat = 'text' | 'number' | 'currency' | 'acreage';
export type SearchProviderKind = 'mock' | 'ogcApiFeatures' | 'wfs';
export type LayerVisibilityState = Record<OperationalLayerId, boolean>;

export interface PopupFieldConfig {
  field: string;
  label: string;
  format?: PopupFieldFormat;
  emptyText?: string;
}

export interface PopupConfig {
  titleField: string;
  emptyValueText: string;
  fields: PopupFieldConfig[];
}

interface SearchConfigBase {
  kind: SearchProviderKind;
  parcelIdField: string;
  maxResults: number;
  resultSubtitleField?: string;
}

export interface MockSearchConfig extends SearchConfigBase {
  kind: 'mock';
}

export interface OgcApiFeaturesSearchConfig extends SearchConfigBase {
  kind: 'ogcApiFeatures';
  url: string;
}

export interface WfsSearchConfig extends SearchConfigBase {
  kind: 'wfs';
  url: string;
  typeName: string;
  version: string;
  outputFormat: string;
  srsName: string;
}

export type SearchConfig = MockSearchConfig | OgcApiFeaturesSearchConfig | WfsSearchConfig;

export interface BasemapLayerConfigBase {
  id: BasemapId;
  label: string;
  description: string;
}

export interface OSMBasemapLayerConfig extends BasemapLayerConfigBase {
  sourceType: 'osm';
}

export interface XYZBasemapLayerConfig extends BasemapLayerConfigBase {
  sourceType: 'xyz';
  url: string;
  attribution?: string;
}

export type BasemapLayerConfig = OSMBasemapLayerConfig | XYZBasemapLayerConfig;

export interface OperationalLayerConfigBase {
  id: OperationalLayerId;
  label: string;
  description: string;
  visibleByDefault: boolean;
  includeInPrint: boolean;
  enabled: boolean;
  opacity?: number;
}

export interface QgisImageWmsLayerConfig extends OperationalLayerConfigBase {
  sourceType: 'qgisImageWms';
  qgisLayerName: string;
  identifyEnabled?: boolean;
  searchable?: boolean;
}

export interface XYZOperationalLayerConfig extends OperationalLayerConfigBase {
  sourceType: 'xyz';
  url: string;
  attribution?: string;
}

export interface TileWmsOperationalLayerConfig extends OperationalLayerConfigBase {
  sourceType: 'tileWms';
  url: string;
  layerName: string;
  serverType: 'geoserver' | 'mapserver' | 'qgis';
}

export type OperationalLayerConfig =
  | QgisImageWmsLayerConfig
  | XYZOperationalLayerConfig
  | TileWmsOperationalLayerConfig;

export interface AppConfig {
  appTitle: string;
  appSubtitle: string;
  qgisBaseUrl: string;
  qgisProjectName: string;
  printLayoutName: string;
  initialCenter: [number, number];
  initialZoom: number;
  projection: string;
  defaultBasemapId: BasemapId;
  basemaps: BasemapLayerConfig[];
  operationalLayers: OperationalLayerConfig[];
  identifyLayerId: OperationalLayerId;
  popup: PopupConfig;
  search: SearchConfig;
}
