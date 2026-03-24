import { useEffect, useState } from 'react';
import type Map from 'ol/Map';
import { unByKey } from 'ol/Observable';
import type { AppConfig } from '../types/config';
import type { IdentifyPopupData } from '../types/parcel';
import { buildFeatureInfoUrl, fetchParcelIdentify } from '../services/qgisWms';
import type ImageWMS from 'ol/source/ImageWMS';

export const useParcelIdentify = (map: Map | null, config: AppConfig) => {
  const [popup, setPopup] = useState<IdentifyPopupData | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    const key = map.on('singleclick', async (event) => {
      const parcelLayer = map
        .getLayers()
        .getArray()
        .find((layer) => layer.get('id') === 'parcel-unlabeled');

      if (!parcelLayer || !parcelLayer.getVisible()) {
        setPopup(null);
        return;
      }

      const source = parcelLayer.getSource() as ImageWMS | undefined;
      if (!source) {
        return;
      }

      const featureInfoUrl = buildFeatureInfoUrl(map, event.coordinate, source, config);
      if (!featureInfoUrl) {
        return;
      }

      try {
        const result = await fetchParcelIdentify(featureInfoUrl, config, event.coordinate);
        setPopup(result);
      } catch {
        setPopup(null);
      }
    });

    return () => {
      unByKey(key);
    };
  }, [map, config]);

  return {
    popup,
    clearPopup: () => setPopup(null)
  };
};
