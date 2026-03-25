import type Map from 'ol/Map';
import type { AppConfig, LayerVisibilityState } from '../types/config';
import { getEnabledOperationalLayers, isQgisImageWmsLayer, isTileWmsOperationalLayer } from '../config/layerRegistry';
import { buildGetPrintUrl } from './qgisWms';

export const getVisibleLayerNames = (config: AppConfig, visibility: LayerVisibilityState): string[] => {
  return getEnabledOperationalLayers(config)
    .filter((layer) => layer.includeInPrint && visibility[layer.id])
    .flatMap((layer) => {
      if (isQgisImageWmsLayer(layer)) {
        return [layer.qgisLayerName];
      }

      if (isTileWmsOperationalLayer(layer)) {
        return [layer.layerName];
      }

      return [];
    });
};

export const triggerPrint = (map: Map, config: AppConfig, visibility: LayerVisibilityState): string => {
  const visibleLayerNames = getVisibleLayerNames(config, visibility);
  if (visibleLayerNames.length === 0) {
    throw new Error('Turn on at least one printable parcel layer before generating a PDF.');
  }

  const printUrl = buildGetPrintUrl(map, config, visibleLayerNames);

  window.open(printUrl, '_blank', 'noopener,noreferrer');
  return printUrl;
};
