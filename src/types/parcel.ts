import type Geometry from 'ol/geom/Geometry';

export interface ParcelAttributes {
  [key: string]: string | number | null;
}

export interface ParcelResult {
  id: string;
  attributes: ParcelAttributes;
  geometry?: Geometry;
  bbox?: [number, number, number, number];
}

export interface IdentifyPopupData {
  title: string;
  attributes: ParcelAttributes;
  coordinate: [number, number];
}
