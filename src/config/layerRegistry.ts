import { LayerConfig } from "../types";

export class LayerRegistry {
  private readonly byId: Map<string, LayerConfig>;

  public constructor(config: LayerConfig[]) {
    this.byId = new Map(config.map((layer) => [layer.id, layer]));
  }

  public getAll(): LayerConfig[] {
    return [...this.byId.values()];
  }

  public getDefaultVisibleLayerIds(): string[] {
    return this.getAll()
      .filter((layer) => layer.visibleByDefault)
      .map((layer) => layer.id);
  }

  public getById(id: string): LayerConfig {
    const layer = this.byId.get(id);
    if (!layer) {
      throw new Error(`Layer '${id}' is not registered.`);
    }

    return layer;
  }
}
