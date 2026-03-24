import { toLonLat } from 'ol/proj';
import type Map from 'ol/Map';
import type { Coordinate } from 'ol/coordinate';
import type ImageWMS from 'ol/source/ImageWMS';
import GeoJSON from 'ol/format/GeoJSON';
import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import type { AppConfig } from '../types/config';
import type { IdentifyPopupData } from '../types/parcel';
import type { QgisFeatureInfoResponse } from '../types/qgis';
import { appendQueryParams } from '../utils/url';

const geoJsonFormat = new GeoJSON();

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

  return source.getFeatureInfoUrl(coordinate, resolution, view.getProjection(), {
    INFO_FORMAT: 'application/json',
    QUERY_LAYERS: config.parcelLayerName,
    FEATURE_COUNT: 1
  });
};

const pickConfiguredAttributes = (properties: Record<string, unknown>, fields: string[]): Record<string, string | number | null> => {
  if (fields.length === 0) {
    return Object.fromEntries(
      Object.entries(properties).map(([key, value]) => [key, typeof value === 'string' || typeof value === 'number' ? value : null])
    );
  }

  return fields.reduce<Record<string, string | number | null>>((acc, key) => {
    const value = properties[key];
    acc[key] = typeof value === 'string' || typeof value === 'number' ? value : null;
    return acc;
  }, {});
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

  const titleField = config.searchableParcelField;
  const title = String(feature.properties[titleField] ?? 'Parcel');

  return {
    title,
    attributes: pickConfiguredAttributes(feature.properties, config.identifyFields),
    coordinate: [coordinate[0], coordinate[1]]
  };
};

export const buildGetPrintUrl = (
  map: Map,
  config: AppConfig,
  visibleLayerNames: string[]
): string => {
  const view = map.getView();
  const extent = view.calculateExtent(map.getSize());
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

export const parseGeoJsonFeature = (rawFeature: GeoJSON.Feature): Feature<Geometry> =>
  geoJsonFormat.readFeature(rawFeature, {
    featureProjection: 'EPSG:3857'
  });
