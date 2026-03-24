import type { LayerVisibilityState } from '../types/config';

interface LayerControlsProps {
  visibility: LayerVisibilityState;
  onChange: (next: Partial<LayerVisibilityState>) => void;
}

const LayerControls = ({ visibility, onChange }: LayerControlsProps) => (
  <section className="panel-section">
    <h3>Layers</h3>
    <label>
      <input
        type="checkbox"
        checked={visibility.aerialVisible}
        onChange={(event) => onChange({ aerialVisible: event.target.checked })}
      />
      Aerial imagery overlay
    </label>
    <label>
      <input
        type="checkbox"
        checked={visibility.parcelsVisible}
        onChange={(event) => onChange({ parcelsVisible: event.target.checked })}
      />
      Parcel boundaries
    </label>
    <label>
      <input
        type="checkbox"
        checked={visibility.parcelLabelsVisible}
        onChange={(event) => onChange({ parcelLabelsVisible: event.target.checked })}
      />
      Parcel labels
    </label>
    <label>
      <input
        type="checkbox"
        checked={visibility.externalWmsVisible}
        onChange={(event) => onChange({ externalWmsVisible: event.target.checked })}
      />
      External WMS overlay
    </label>
  </section>
);

export default LayerControls;
