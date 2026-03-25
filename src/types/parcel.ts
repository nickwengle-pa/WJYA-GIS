import type Geometry from 'ol/geom/Geometry';
import type { SearchProviderKind } from './config';

export interface ParcelAttributes {
  [key: string]: string | number | null;
}

export interface ParcelResult {
  id: string;
  title: string;
  subtitle?: string;
  attributes: ParcelAttributes;
  geometry?: Geometry;
  bbox?: [number, number, number, number];
  source: SearchProviderKind;
}

export interface PopupRow {
  label: string;
  value: string;
}

export interface IdentifyPopupData {
  title: string;
  rows: PopupRow[];
  coordinate: [number, number];
}
