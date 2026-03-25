import type {
  AppConfig,
  BasemapId,
  BasemapLayerConfig,
  LayerVisibilityState,
  OperationalLayerConfig,
  OperationalLayerId,
  QgisImageWmsLayerConfig,
  TileWmsOperationalLayerConfig,
  XYZOperationalLayerConfig
} from '../types/config';
import { operationalLayerIds } from '../types/config';

interface LayerRegistryEnv {
  parcelLayerName: string;
  parcelLabelLayerName: string;
  externalWmsUrl?: string;
  externalWmsLayerName?: string;
}

export const createLayerRegistry = (env: LayerRegistryEnv): Pick<AppConfig, 'basemaps' | 'operationalLayers'> => {
  const hasExternalWms = Boolean(env.externalWmsUrl && env.externalWmsLayerName);

  const basemaps: BasemapLayerConfig[] = [
    {
      id: 'street',
      label: 'Street Map',
      description: 'Reliable street basemap for parcel search and ownership review.',
      sourceType: 'osm'
    },
    {
      id: 'imagery',
      label: 'Imagery',
      description: 'Replace this sample imagery URL with the county-approved aerial service.',
      sourceType: 'xyz',
      url: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg'
    }
  ];

  const operationalLayers: OperationalLayerConfig[] = [
    {
      id: 'parcel-fill',
      label: 'Parcels',
      description: 'County parcel boundaries from the published QGIS project.',
      sourceType: 'qgisImageWms',
      qgisLayerName: env.parcelLayerName,
      visibleByDefault: true,
      includeInPrint: true,
      identifyEnabled: true,
      searchable: true,
      enabled: true
    },
    {
      id: 'parcel-labels',
      label: 'Parcel Labels',
      description: 'Separate parcel label layer for cleaner labeling and print control.',
      sourceType: 'qgisImageWms',
      qgisLayerName: env.parcelLabelLayerName,
      visibleByDefault: false,
      includeInPrint: true,
      enabled: true
    },
    {
      id: 'aerial-overlay',
      label: 'Aerial Overlay',
      description: 'Optional translucent overlay. Replace with county imagery if you need it above the basemap.',
      sourceType: 'xyz',
      url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
      visibleByDefault: false,
      includeInPrint: false,
      enabled: true,
      opacity: 0.55
    },
    {
      id: 'zoning-overlay',
      label: 'Zoning',
      description: hasExternalWms
        ? 'Optional external zoning overlay.'
        : 'Set VITE_EXTERNAL_WMS_URL and VITE_EXTERNAL_WMS_LAYER_NAME to enable this county overlay.',
      sourceType: 'tileWms',
      url: env.externalWmsUrl ?? 'https://services.example.com/geoserver/wms',
      layerName: env.externalWmsLayerName ?? 'zoning:districts',
      serverType: 'geoserver',
      visibleByDefault: false,
      includeInPrint: true,
      enabled: hasExternalWms
    }
  ];

  return {
    basemaps,
    operationalLayers
  };
};

export const getDefaultLayerVisibility = (layers: OperationalLayerConfig[]): LayerVisibilityState => {
  const visibility = Object.fromEntries(operationalLayerIds.map((id) => [id, false])) as LayerVisibilityState;

  layers.forEach((layer) => {
    visibility[layer.id] = layer.enabled && layer.visibleByDefault;
  });

  return visibility;
};

export const getBasemapById = (config: Pick<AppConfig, 'basemaps'>, basemapId: BasemapId): BasemapLayerConfig | undefined =>
  config.basemaps.find((basemap) => basemap.id === basemapId);

export const getOperationalLayerById = (
  config: Pick<AppConfig, 'operationalLayers'>,
  layerId: OperationalLayerId
): OperationalLayerConfig | undefined => config.operationalLayers.find((layer) => layer.id === layerId);

export const getEnabledOperationalLayers = (config: Pick<AppConfig, 'operationalLayers'>): OperationalLayerConfig[] =>
  config.operationalLayers.filter((layer) => layer.enabled);

export const isQgisImageWmsLayer = (layer: OperationalLayerConfig): layer is QgisImageWmsLayerConfig =>
  layer.sourceType === 'qgisImageWms';

export const isXyzOperationalLayer = (layer: OperationalLayerConfig): layer is XYZOperationalLayerConfig =>
  layer.sourceType === 'xyz';

export const isTileWmsOperationalLayer = (layer: OperationalLayerConfig): layer is TileWmsOperationalLayerConfig =>
  layer.sourceType === 'tileWms';
