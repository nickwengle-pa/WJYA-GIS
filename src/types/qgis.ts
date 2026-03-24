export interface QgisFeatureInfoResponse {
  type?: string;
  features?: Array<{
    id?: string;
    type?: string;
    geometry?: unknown;
    properties?: Record<string, unknown>;
  }>;
}

export interface OgcApiFeaturesResponse {
  type: string;
  features: Array<{
    id?: string;
    geometry?: GeoJSON.Geometry;
    properties: Record<string, unknown>;
    bbox?: [number, number, number, number];
  }>;
}
