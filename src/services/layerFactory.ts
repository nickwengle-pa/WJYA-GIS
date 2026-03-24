import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import type { AppConfig } from '../types/config';

const buildQgisMapUrl = (config: AppConfig): string => {
  const url = new URL(config.qgisBaseUrl);
  url.searchParams.set('MAP', config.qgisProjectName);
  return url.toString();
};

export const createBasemapLayer = (type: 'osm' | 'satellite'): TileLayer<OSM | XYZ> => {
  if (type === 'satellite') {
    return new TileLayer({
      source: new XYZ({
        // Replace with your organization-approved aerial XYZ source.
        url: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg'
      }),
      properties: { id: 'basemap-satellite' }
    });
  }

  return new TileLayer({
    source: new OSM(),
    properties: { id: 'basemap-osm' }
  });
};

export const createAerialOverlayLayer = (): TileLayer<XYZ> =>
  new TileLayer({
    source: new XYZ({
      // Optional aerial overlay source.
      url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png'
    }),
    visible: false,
    opacity: 0.6,
    properties: { id: 'aerial-overlay' }
  });

export const createParcelLayer = (config: AppConfig): ImageLayer<ImageWMS> =>
  new ImageLayer({
    source: new ImageWMS({
      url: buildQgisMapUrl(config),
      params: {
        SERVICE: 'WMS',
        VERSION: '1.3.0',
        REQUEST: 'GetMap',
        FORMAT: 'image/png',
        TRANSPARENT: true,
        LAYERS: config.parcelLayerName
      },
      ratio: 1,
      serverType: 'qgis'
    }),
    visible: true,
    properties: { id: 'parcel-unlabeled' }
  });

export const createParcelLabelLayer = (config: AppConfig): ImageLayer<ImageWMS> =>
  new ImageLayer({
    source: new ImageWMS({
      url: buildQgisMapUrl(config),
      params: {
        SERVICE: 'WMS',
        VERSION: '1.3.0',
        REQUEST: 'GetMap',
        FORMAT: 'image/png',
        TRANSPARENT: true,
        LAYERS: config.parcelLabelLayerName
      },
      ratio: 1,
      serverType: 'qgis'
    }),
    visible: false,
    properties: { id: 'parcel-labeled' }
  });

export const createExternalWmsLayer = (config: AppConfig): TileLayer<TileWMS> | null => {
  if (!config.externalWmsUrl || !config.externalWmsLayerName) {
    return null;
  }

  return new TileLayer({
    source: new TileWMS({
      url: config.externalWmsUrl,
      params: {
        LAYERS: config.externalWmsLayerName,
        TILED: true,
        FORMAT: 'image/png',
        TRANSPARENT: true
      },
      serverType: 'geoserver'
    }),
    visible: false,
    properties: { id: 'external-wms' }
  });
};
