import { useState } from 'react';
import type Map from 'ol/Map';
import type { AppConfig, LayerVisibilityState } from '../types/config';
import { triggerPrint } from '../services/printService';

export const usePrint = (map: Map | null, config: AppConfig, visibility: LayerVisibilityState) => {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrintUrl, setLastPrintUrl] = useState<string | null>(null);

  const runPrint = async (): Promise<void> => {
    if (!map) {
      setError('Wait for the map to finish loading before generating a print.');
      return;
    }

    setPrinting(true);
    setError(null);

    try {
      const url = triggerPrint(map, config, visibility);
      setLastPrintUrl(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to generate the print request.');
    } finally {
      setPrinting(false);
    }
  };

  return {
    printing,
    canPrint: Boolean(map),
    error,
    runPrint,
    lastPrintUrl
  };
};
