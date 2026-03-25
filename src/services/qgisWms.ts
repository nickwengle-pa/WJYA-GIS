import { toLonLat } from 'ol/proj';
import type Map from 'ol/Map';
import type { Coordinate } from 'ol/coordinate';
import type ImageWMS from 'ol/source/ImageWMS';
import type { AppConfig } from '../types/config';
import type { IdentifyPopupData } from '../types/parcel';
import type { QgisFeatureInfoResponse } from '../types/qgis';
import { getOperationalLayerById, isQgisImageWmsLayer } from '../config/layerRegistry';
import { buildIdentifyPopup } from './popupFormatter';
import { appendQueryParams } from '../utils/url';

export const buildQgisMapBaseUrl = (config: AppConfig): string => {
  const url = new URL(config.qgisBaseUrl);
  url.searchParams.set('MAP', config.qgisProjectName);
  return url.toString();
};

export const buildFeatureInfoUrl = (
  map: Map,
  coordinate: Coordinate,
  source: ImageWMS,
  config: AppConfig
): string | undefined => {
  const view = map.getView();
  const resolution = view.getResolution();

  if (!resolution) {
    return undefined;
  }

  const identifyLayer = getOperationalLayerById(config, config.identifyLayerId);
  if (!identifyLayer || !isQgisImageWmsLayer(identifyLayer)) {
    return undefined;
  }

  return source.getFeatureInfoUrl(coordinate, resolution, view.getProjection(), {
    INFO_FORMAT: 'application/json',
    QUERY_LAYERS: identifyLayer.qgisLayerName,
    FEATURE_COUNT: 1
  });
};

export const fetchParcelIdentify = async (
  featureInfoUrl: string,
  config: AppConfig,
  coordinate: Coordinate
): Promise<IdentifyPopupData | null> => {
  const response = await fetch(featureInfoUrl);

  if (!response.ok) {
    throw new Error(`GetFeatureInfo failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as QgisFeatureInfoResponse;
  const feature = data.features?.[0];
  if (!feature || !feature.properties) {
    return null;
  }

  return buildIdentifyPopup(feature.properties, coordinate, config.popup);
};

export const buildGetPrintUrl = (
  map: Map,
  config: AppConfig,
  visibleLayerNames: string[]
): string => {
  const view = map.getView();
  const mapSize = map.getSize();
  if (!mapSize) {
    throw new Error('Cannot generate a print URL before the map has a rendered size.');
  }

  const extent = view.calculateExtent(mapSize);
  const [minLon, minLat] = toLonLat([extent[0], extent[1]], view.getProjection());
  const [maxLon, maxLat] = toLonLat([extent[2], extent[3]], view.getProjection());

  return appendQueryParams(buildQgisMapBaseUrl(config), {
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetPrint',
    TEMPLATE: config.printLayoutName,
    FORMAT: 'pdf',
    CRS: 'EPSG:4326',
    LAYERS: visibleLayerNames.join(','),
    MAP0: `${minLon},${minLat},${maxLon},${maxLat}`
  });
};
