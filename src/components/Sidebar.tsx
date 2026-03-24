import type { BasemapType, LayerVisibilityState } from '../types/config';
import LayerControls from './LayerControls';
import SearchPanel from './SearchPanel';
import PrintButton from './PrintButton';
import type { ParcelResult } from '../types/parcel';

interface SidebarProps {
  basemap: BasemapType;
  onBasemapChange: (value: BasemapType) => void;
  visibility: LayerVisibilityState;
  onVisibilityChange: (next: Partial<LayerVisibilityState>) => void;
  onSearch: (parcelId: string) => Promise<ParcelResult[]>;
  searching: boolean;
  searchError: string | null;
  onPrint: () => Promise<void>;
  printing: boolean;
  onResetView: () => void;
}

const Sidebar = ({
  basemap,
  onBasemapChange,
  visibility,
  onVisibilityChange,
  onSearch,
  searching,
  searchError,
  onPrint,
  printing,
  onResetView
}: SidebarProps) => (
  <aside className="sidebar">
    <h2>Tax Parcel Viewer</h2>
    <section className="panel-section">
      <h3>Basemap</h3>
      <select value={basemap} onChange={(event) => onBasemapChange(event.target.value as BasemapType)}>
        <option value="osm">OpenStreetMap</option>
        <option value="satellite">Satellite</option>
      </select>
    </section>

    <LayerControls visibility={visibility} onChange={onVisibilityChange} />
    <SearchPanel onSearch={onSearch} searching={searching} error={searchError} />

    <section className="panel-section">
      <h3>Map Actions</h3>
      <PrintButton onPrint={onPrint} printing={printing} />
      <button type="button" onClick={onResetView}>
        Reset View
      </button>
    </section>
  </aside>
);

export default Sidebar;
