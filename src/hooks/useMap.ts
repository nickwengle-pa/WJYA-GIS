import { useEffect, useMemo, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultControls, ScaleLine, MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import type { BasemapType, LayerVisibilityState } from '../types/config';
import type { AppConfig } from '../types/config';
import {
  createAerialOverlayLayer,
  createBasemapLayer,
  createExternalWmsLayer,
  createParcelLabelLayer,
  createParcelLayer
} from '../services/layerFactory';

export const useMap = (config: AppConfig, basemap: BasemapType, visibility: LayerVisibilityState) => {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const baseLayer = useMemo(() => createBasemapLayer(basemap), [basemap]);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    const aerialLayer = createAerialOverlayLayer();
    const parcelLayer = createParcelLayer(config);
    const parcelLabelLayer = createParcelLabelLayer(config);
    const externalWmsLayer = createExternalWmsLayer(config);

    const map = new Map({
      target: mapContainerRef.current,
      layers: [baseLayer, aerialLayer, parcelLayer, parcelLabelLayer, ...(externalWmsLayer ? [externalWmsLayer] : [])],
      view: new View({
        center: fromLonLat(config.initialCenter),
        zoom: config.initialZoom,
        projection: config.projection
      }),
      controls: defaultControls().extend([
        new ScaleLine(),
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: 'EPSG:4326',
          className: 'mouse-position',
          undefinedHTML: '&nbsp;'
        })
      ])
    });

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [baseLayer, config]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.getLayers().forEach((layer) => {
      const id = layer.get('id');
      if (id === 'aerial-overlay') {
        layer.setVisible(visibility.aerialVisible);
      }
      if (id === 'parcel-unlabeled') {
        layer.setVisible(visibility.parcelsVisible);
      }
      if (id === 'parcel-labeled') {
        layer.setVisible(visibility.parcelLabelsVisible);
      }
      if (id === 'external-wms') {
        layer.setVisible(visibility.externalWmsVisible);
      }
    });
  }, [visibility]);

  return {
    mapRef,
    mapContainerRef,
    isMapReady
  };
};
