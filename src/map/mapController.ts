import { LayerConfig, ParcelFeature } from "../types";

interface MapAdapter {
  setActiveLayers(layerConfigs: LayerConfig[]): void;
  focusParcel(parcel: ParcelFeature): void;
}

class NoopMapAdapter implements MapAdapter {
  public setActiveLayers(): void {
    // Intentionally noop for environments where the map library is not loaded.
  }

  public focusParcel(): void {
    // Intentionally noop for environments where the map library is not loaded.
  }
}

export class MapController {
  private adapter: MapAdapter | null = null;

  public initializeOnce(containerId: string, initialCenter: [number, number], initialZoom: number): void {
    if (this.adapter) {
      return;
    }

    const mapLibrary = (window as Window & { L?: unknown }).L;

    if (!mapLibrary) {
      console.warn("Leaflet not found. Map interactions are disabled.");
      this.adapter = new NoopMapAdapter();
      return;
    }

    // Real implementation should be added where Leaflet is bundled/loaded.
    // We keep this isolated so the map is initialized exactly once.
    void containerId;
    void initialCenter;
    void initialZoom;
    this.adapter = new NoopMapAdapter();
  }

  public syncActiveLayers(layerConfigs: LayerConfig[]): void {
    if (!this.adapter) {
      throw new Error("MapController must be initialized before syncing layers.");
    }

    this.adapter.setActiveLayers(layerConfigs);
  }

  public zoomToParcel(parcel: ParcelFeature): void {
    if (!this.adapter) {
      return;
    }

    this.adapter.focusParcel(parcel);
  }
}
