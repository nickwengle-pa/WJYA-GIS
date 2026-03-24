export interface AppConfig {
  qgisBaseUrl: string;
  qgisProjectName: string;
  parcelLayerName: string;
  parcelLabelLayerName: string;
  externalWmsUrl?: string;
  externalWmsLayerName?: string;
  printLayoutName: string;
  initialCenter: [number, number];
  initialZoom: number;
  searchableParcelField: string;
  identifyFields: string[];
  searchEndpointUrl?: string;
  projection: string;
}

export interface LayerVisibilityState {
  aerialVisible: boolean;
  parcelsVisible: boolean;
  parcelLabelsVisible: boolean;
  externalWmsVisible: boolean;
}

export type BasemapType = 'osm' | 'satellite';
