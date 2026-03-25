import { useEffect, useRef, useState } from 'react';
import type Map from 'ol/Map';
import { unByKey } from 'ol/Observable';
import ImageLayer from 'ol/layer/Image';
import type { AppConfig } from '../types/config';
import type { IdentifyPopupData } from '../types/parcel';
import { buildFeatureInfoUrl, fetchParcelIdentify } from '../services/qgisWms';
import type ImageWMS from 'ol/source/ImageWMS';

export const useParcelIdentify = (map: Map | null, config: AppConfig) => {
  const [popup, setPopup] = useState<IdentifyPopupData | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    if (!map) {
      return;
    }

    const key = map.on('singleclick', async (event) => {
      requestSequenceRef.current += 1;
      const requestId = requestSequenceRef.current;
      const parcelLayer = map
        .getLayers()
        .getArray()
        .find(
          (layer): layer is ImageLayer<ImageWMS> => layer.get('id') === config.identifyLayerId && layer instanceof ImageLayer
        );

      setError(null);

      if (!parcelLayer || !parcelLayer.getVisible()) {
        setPopup(null);
        setIdentifying(false);
        return;
      }

      const source = parcelLayer.getSource();
      if (!source) {
        setIdentifying(false);
        return;
      }

      const featureInfoUrl = buildFeatureInfoUrl(map, event.coordinate, source, config);
      if (!featureInfoUrl) {
        setIdentifying(false);
        return;
      }

      setIdentifying(true);

      try {
        const result = await fetchParcelIdentify(featureInfoUrl, config, event.coordinate);
        if (requestSequenceRef.current !== requestId) {
          return;
        }

        setPopup(result);
      } catch (caught) {
        if (requestSequenceRef.current !== requestId) {
          return;
        }

        setPopup(null);
        setError(caught instanceof Error ? caught.message : 'Unable to load parcel details.');
      } finally {
        if (requestSequenceRef.current === requestId) {
          setIdentifying(false);
        }
      }
    });

    return () => {
      requestSequenceRef.current += 1;
      unByKey(key);
    };
  }, [map, config]);

  return {
    popup,
    identifying,
    error,
    clearPopup: () => {
      setPopup(null);
      setError(null);
    }
  };
};
