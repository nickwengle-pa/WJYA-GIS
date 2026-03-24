export type ParcelId = string;

export interface Geometry {
  type: string;
  coordinates: unknown;
}

export interface ParcelFeature {
  id: ParcelId;
  geometry: Geometry;
  properties: Record<string, string | number | null>;
}

export interface FieldFormatConfig {
  key: string;
  label: string;
  fallback?: string;
  formatter?: (value: string | number | null) => string;
}

export interface PopupConfig {
  titleField: string;
  fields: FieldFormatConfig[];
}

export interface LayerConfig {
  id: string;
  label: string;
  sourceUrl: string;
  typeName: string;
  visibleByDefault: boolean;
  style: {
    color: string;
    weight: number;
    fillColor: string;
    fillOpacity: number;
  };
}

export interface AppConfig {
  map: {
    containerId: string;
    center: [number, number];
    zoom: number;
  };
  popup: PopupConfig;
  layers: LayerConfig[];
}

export type SearchBackend = "wfs" | "ogcApiFeatures";

export interface SearchQuery {
  text: string;
  limit?: number;
}

export interface SearchResult {
  parcelId: ParcelId;
  summary: string;
}

export class ServiceError extends Error {
  public readonly status: number | undefined;

  public constructor(message: string, status?: number) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}
