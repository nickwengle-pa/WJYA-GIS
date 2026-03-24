import type Map from 'ol/Map';
import type { AppConfig, LayerVisibilityState } from '../types/config';
import { buildGetPrintUrl } from './qgisWms';

export const getVisibleLayerNames = (config: AppConfig, visibility: LayerVisibilityState): string[] => {
  const layers: string[] = [];

  if (visibility.parcelsVisible) {
    layers.push(config.parcelLayerName);
  }
  if (visibility.parcelLabelsVisible) {
    layers.push(config.parcelLabelLayerName);
  }
  if (visibility.externalWmsVisible && config.externalWmsLayerName) {
    layers.push(config.externalWmsLayerName);
  }

  return layers;
};

export const triggerPrint = (map: Map, config: AppConfig, visibility: LayerVisibilityState): string => {
  const visibleLayerNames = getVisibleLayerNames(config, visibility);
  const printUrl = buildGetPrintUrl(map, config, visibleLayerNames);

  window.open(printUrl, '_blank', 'noopener,noreferrer');
  return printUrl;
};
