import type BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import type { AppConfig, BasemapLayerConfig, OperationalLayerConfig } from '../types/config';
import { isQgisImageWmsLayer, isTileWmsOperationalLayer } from '../config/layerRegistry';

const buildQgisMapUrl = (config: AppConfig): string => {
  const url = new URL(config.qgisBaseUrl);
  url.searchParams.set('MAP', config.qgisProjectName);
  return url.toString();
};

export const createBasemapLayer = (definition: BasemapLayerConfig): TileLayer<OSM | XYZ> => {
  if (definition.sourceType === 'xyz') {
    return new TileLayer({
      source: new XYZ({
        url: definition.url
      }),
      properties: { id: definition.id }
    });
  }

  return new TileLayer({
    source: new OSM(),
    properties: { id: definition.id }
  });
};

export const createOperationalLayer = (definition: OperationalLayerConfig, config: AppConfig): BaseLayer => {
  if (isQgisImageWmsLayer(definition)) {
    return new ImageLayer({
      source: new ImageWMS({
        url: buildQgisMapUrl(config),
        params: {
          SERVICE: 'WMS',
          VERSION: '1.3.0',
          REQUEST: 'GetMap',
          FORMAT: 'image/png',
          TRANSPARENT: true,
          LAYERS: definition.qgisLayerName
        },
        ratio: 1,
        serverType: 'qgis'
      }),
      visible: definition.visibleByDefault,
      opacity: definition.opacity ?? 1,
      properties: { id: definition.id }
    });
  }

  if (isTileWmsOperationalLayer(definition)) {
    return new TileLayer({
      source: new TileWMS({
        url: definition.url,
        params: {
          LAYERS: definition.layerName,
          TILED: true,
          FORMAT: 'image/png',
          TRANSPARENT: true
        },
        serverType: definition.serverType
      }),
      visible: definition.visibleByDefault,
      opacity: definition.opacity ?? 1,
      properties: { id: definition.id }
    });
  }

  return new TileLayer({
    source: new XYZ({
      url: definition.url
    }),
    visible: definition.visibleByDefault,
    opacity: definition.opacity ?? 1,
    properties: { id: definition.id }
  });
};
