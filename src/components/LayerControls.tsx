import type { LayerVisibilityState, OperationalLayerConfig } from '../types/config';

interface LayerControlsProps {
  layers: OperationalLayerConfig[];
  visibility: LayerVisibilityState;
  onChange: (next: Partial<LayerVisibilityState>) => void;
}

const LayerControls = ({ layers, visibility, onChange }: LayerControlsProps) => (
  <section className="sidebar-card">
    <div className="section-header">
      <h3>Layers</h3>
      <span>{layers.filter((layer) => layer.enabled).length} available</span>
    </div>
    <div className="layer-list">
      {layers.map((layer) => (
        <label key={layer.id} className={`layer-row ${layer.enabled ? '' : 'disabled'}`}>
          <input
            type="checkbox"
            checked={Boolean(visibility[layer.id])}
            disabled={!layer.enabled}
            onChange={(event) => onChange({ [layer.id]: event.target.checked })}
          />
          <span className="layer-meta">
            <strong>{layer.label}</strong>
            <span>{layer.description}</span>
          </span>
        </label>
      ))}
    </div>
  </section>
);

export default LayerControls;
