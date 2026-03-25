import type { BasemapId, BasemapLayerConfig, LayerVisibilityState, OperationalLayerConfig, SearchProviderKind } from '../types/config';
import LayerControls from './LayerControls';
import SearchPanel from './SearchPanel';
import PrintButton from './PrintButton';
import type { ParcelResult } from '../types/parcel';

interface SidebarProps {
  title: string;
  subtitle: string;
  basemaps: BasemapLayerConfig[];
  basemapId: BasemapId;
  onBasemapChange: (value: BasemapId) => void;
  layers: OperationalLayerConfig[];
  visibility: LayerVisibilityState;
  onVisibilityChange: (next: Partial<LayerVisibilityState>) => void;
  onSearch: (parcelId: string) => Promise<ParcelResult[]>;
  onSelectSearchResult: (result: ParcelResult) => void;
  searchProvider: SearchProviderKind;
  searchResults: ParcelResult[];
  searchStatus: 'idle' | 'loading' | 'success' | 'error';
  lastSearchQuery: string;
  searching: boolean;
  searchError: string | null;
  mapReady: boolean;
  identifying: boolean;
  identifyError: string | null;
  onPrint: () => Promise<void>;
  printing: boolean;
  canPrint: boolean;
  printError: string | null;
  onResetView: () => void;
}

const Sidebar = ({
  title,
  subtitle,
  basemaps,
  basemapId,
  onBasemapChange,
  layers,
  visibility,
  onVisibilityChange,
  onSearch,
  onSelectSearchResult,
  searchProvider,
  searchResults,
  searchStatus,
  lastSearchQuery,
  searching,
  searchError,
  mapReady,
  identifying,
  identifyError,
  onPrint,
  printing,
  canPrint,
  printError,
  onResetView
}: SidebarProps) => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <p className="eyebrow">County GIS</p>
      <h2>{title}</h2>
      <p className="sidebar-subtitle">{subtitle}</p>
      <div className="status-strip">
        <span className={`status-pill ${mapReady ? 'ready' : 'loading'}`}>{mapReady ? 'Map ready' : 'Map loading'}</span>
        {searching ? <span className="status-pill loading">Searching</span> : null}
        {identifying ? <span className="status-pill loading">Identifying</span> : null}
      </div>
      {identifyError ? <p className="status-banner error">{identifyError}</p> : null}
    </div>

    <section className="sidebar-card">
      <div className="section-header">
        <h3>Basemap</h3>
        <span>{basemaps.length} options</span>
      </div>
      <div className="basemap-list">
        {basemaps.map((basemap) => (
          <button
            key={basemap.id}
            type="button"
            className={`basemap-option ${basemap.id === basemapId ? 'active' : ''}`}
            onClick={() => onBasemapChange(basemap.id)}
          >
            <strong>{basemap.label}</strong>
            <span>{basemap.description}</span>
          </button>
        ))}
      </div>
    </section>

    <LayerControls layers={layers} visibility={visibility} onChange={onVisibilityChange} />
    <SearchPanel
      onSearch={onSearch}
      onSelectResult={onSelectSearchResult}
      provider={searchProvider}
      results={searchResults}
      status={searchStatus}
      lastQuery={lastSearchQuery}
      searching={searching}
      error={searchError}
    />

    <section className="sidebar-card">
      <div className="section-header">
        <h3>Map Actions</h3>
        <span>Print and navigate</span>
      </div>
      <PrintButton onPrint={onPrint} printing={printing} canPrint={canPrint} error={printError} />
      <button type="button" className="secondary-action" onClick={onResetView}>
        Reset View
      </button>
    </section>
  </aside>
);

export default Sidebar;
