import { useMemo, useState } from 'react';
import { fromLonLat } from 'ol/proj';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ParcelPopup from './components/ParcelPopup';
import { useMap } from './hooks/useMap';
import { useParcelSearch } from './hooks/useParcelSearch';
import { useParcelIdentify } from './hooks/useParcelIdentify';
import { usePrint } from './hooks/usePrint';
import { appConfig } from './services/config';
import type { BasemapType, LayerVisibilityState } from './types/config';

const defaultVisibility: LayerVisibilityState = {
  aerialVisible: false,
  parcelsVisible: true,
  parcelLabelsVisible: false,
  externalWmsVisible: false
};

const App = () => {
  const [basemap, setBasemap] = useState<BasemapType>('osm');
  const [visibility, setVisibility] = useState<LayerVisibilityState>(defaultVisibility);

  const config = useMemo(() => appConfig, []);
  const { mapRef, mapContainerRef } = useMap(config, basemap, visibility);

  const { runSearch, searching, error: searchError } = useParcelSearch(mapRef.current, config);
  const { popup, clearPopup } = useParcelIdentify(mapRef.current, config);
  const { runPrint, printing } = usePrint(mapRef.current, config, visibility);

  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.getView().animate({
      center: fromLonLat(config.initialCenter),
      zoom: config.initialZoom,
      duration: 300
    });
  };

  return (
    <div className="app-shell">
      <Sidebar
        basemap={basemap}
        onBasemapChange={setBasemap}
        visibility={visibility}
        onVisibilityChange={(next) => setVisibility((current) => ({ ...current, ...next }))}
        onSearch={runSearch}
        searching={searching}
        searchError={searchError}
        onPrint={runPrint}
        printing={printing}
        onResetView={handleResetView}
      />
      <main className="map-panel">
        <MapView mapContainerRef={mapContainerRef} />
        <ParcelPopup map={mapRef.current} popup={popup} onClose={clearPopup} />
      </main>
    </div>
  );
};

export default App;
