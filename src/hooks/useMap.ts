import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import type BaseLayer from 'ol/layer/Base';
import { defaults as defaultControls, MousePosition, ScaleLine } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import { getBasemapById, getEnabledOperationalLayers } from '../config/layerRegistry';
import { createBasemapLayer, createOperationalLayer } from '../services/layerFactory';
import type { AppConfig, BasemapId, LayerVisibilityState, OperationalLayerId } from '../types/config';

export const useMap = (config: AppConfig, basemapId: BasemapId, visibility: LayerVisibilityState) => {
  const mapRef = useRef<Map | null>(null);
  const operationalLayerRefs = useRef<Partial<Record<OperationalLayerId, BaseLayer>>>({});
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    const initialBasemap = getBasemapById(config, basemapId) ?? config.basemaps[0];
    const operationalLayers = getEnabledOperationalLayers(config).map((layerDefinition) => {
      const layer = createOperationalLayer(layerDefinition, config);
      operationalLayerRefs.current[layerDefinition.id] = layer;
      return layer;
    });

    const nextMap = new Map({
      target: mapContainerRef.current,
      layers: [createBasemapLayer(initialBasemap), ...operationalLayers],
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
          placeholder: '&nbsp;'
        })
      ])
    });

    mapRef.current = nextMap;
    setMap(nextMap);
    setIsMapReady(true);

    return () => {
      nextMap.setTarget(undefined);
      mapRef.current = null;
      operationalLayerRefs.current = {};
      setMap(null);
      setIsMapReady(false);
    };
  }, [config]);

  useEffect(() => {
    const currentMap = mapRef.current;
    const nextBasemap = getBasemapById(config, basemapId);
    if (!currentMap || !nextBasemap) {
      return;
    }

    const layers = currentMap.getLayers();
    const currentBasemap = layers.item(0);
    if (currentBasemap?.get('id') === nextBasemap.id) {
      return;
    }

    layers.setAt(0, createBasemapLayer(nextBasemap));
  }, [basemapId, config]);

  useEffect(() => {
    getEnabledOperationalLayers(config).forEach((layerDefinition) => {
      const layer = operationalLayerRefs.current[layerDefinition.id];
      if (layer) {
        layer.setVisible(Boolean(visibility[layerDefinition.id]));
      }
    });
  }, [config, visibility]);

  return {
    map,
    mapContainerRef,
    isMapReady
  };
};
