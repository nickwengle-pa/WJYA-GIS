import { useState } from 'react';
import { fromLonLat } from 'ol/proj';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ParcelPopup from './components/ParcelPopup';
import { appConfig } from './config/appConfig';
import { getDefaultLayerVisibility } from './config/layerRegistry';
import { useMap } from './hooks/useMap';
import { useParcelSearch } from './hooks/useParcelSearch';
import { useParcelIdentify } from './hooks/useParcelIdentify';
import { usePrint } from './hooks/usePrint';
import type { BasemapId, LayerVisibilityState } from './types/config';

const App = () => {
  const [basemapId, setBasemapId] = useState<BasemapId>(appConfig.defaultBasemapId);
  const [visibility, setVisibility] = useState<LayerVisibilityState>(() => getDefaultLayerVisibility(appConfig.operationalLayers));

  const { map, mapContainerRef, isMapReady } = useMap(appConfig, basemapId, visibility);

  const { results, runSearch, zoomToResult, searching, status: searchStatus, error: searchError, lastQuery } = useParcelSearch(
    map,
    appConfig
  );
  const { popup, clearPopup, identifying, error: identifyError } = useParcelIdentify(map, appConfig);
  const { runPrint, printing, canPrint, error: printError } = usePrint(map, appConfig, visibility);

  const handleResetView = () => {
    if (!map) {
      return;
    }

    map.getView().animate({
      center: fromLonLat(appConfig.initialCenter),
      zoom: appConfig.initialZoom,
      duration: 300
    });
  };

  return (
    <div className="app-shell">
      <Sidebar
        title={appConfig.appTitle}
        subtitle={appConfig.appSubtitle}
        basemaps={appConfig.basemaps}
        basemapId={basemapId}
        onBasemapChange={setBasemapId}
        layers={appConfig.operationalLayers}
        visibility={visibility}
        onVisibilityChange={(next) => setVisibility((current) => ({ ...current, ...next }))}
        onSearch={runSearch}
        onSelectSearchResult={zoomToResult}
        searchProvider={appConfig.search.kind}
        searchResults={results}
        searchStatus={searchStatus}
        lastSearchQuery={lastQuery}
        searching={searching}
        searchError={searchError}
        mapReady={isMapReady}
        identifying={identifying}
        identifyError={identifyError}
        onPrint={runPrint}
        printing={printing}
        canPrint={canPrint}
        printError={printError}
        onResetView={handleResetView}
      />
      <main className="map-panel">
        <MapView mapContainerRef={mapContainerRef} isMapReady={isMapReady} />
        <ParcelPopup map={map} popup={popup} onClose={clearPopup} />
      </main>
    </div>
  );
};

export default App;
