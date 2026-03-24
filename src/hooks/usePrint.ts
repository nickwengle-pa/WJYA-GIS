import { useState } from 'react';
import type Map from 'ol/Map';
import type { AppConfig, LayerVisibilityState } from '../types/config';
import { triggerPrint } from '../services/printService';

export const usePrint = (map: Map | null, config: AppConfig, visibility: LayerVisibilityState) => {
  const [printing, setPrinting] = useState(false);
  const [lastPrintUrl, setLastPrintUrl] = useState<string | null>(null);

  const runPrint = async (): Promise<void> => {
    if (!map) {
      return;
    }

    setPrinting(true);

    try {
      const url = triggerPrint(map, config, visibility);
      setLastPrintUrl(url);
    } finally {
      setPrinting(false);
    }
  };

  return {
    printing,
    runPrint,
    lastPrintUrl
  };
};
