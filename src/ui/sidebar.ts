import { LayerRegistry } from "../config/layerRegistry";
import { AppState } from "../state/store";

interface SidebarActions {
  onLayerToggle: (layerId: string) => void;
  onSearchSubmit: (query: string) => void;
  onBackendChange: (backend: "wfs" | "ogcApiFeatures") => void;
}

export class SidebarView {
  private readonly root: HTMLElement;

  public constructor(root: HTMLElement, private readonly layerRegistry: LayerRegistry, private readonly actions: SidebarActions) {
    this.root = root;
    this.attachEvents();
  }

  public render(state: AppState): void {
    const layersMarkup = this.layerRegistry.getAll().map((layer) => {
      const checked = state.activeLayerIds.has(layer.id) ? "checked" : "";
      return `<label class=\"layer-item\"><input type=\"checkbox\" data-layer-id=\"${layer.id}\" ${checked} />${layer.label}</label>`;
    }).join("");

    const resultsMarkup = state.searchResults
      .map((item) => `<li title=\"${item.summary}\">${item.summary}</li>`)
      .join("");

    const loadingMarkup = state.isLoading ? `<p class=\"sidebar-loading\">Loading…</p>` : "";
    const errorMarkup = state.errorMessage ? `<p class=\"sidebar-error\">${state.errorMessage}</p>` : "";

    this.root.innerHTML = `
      <div class="sidebar-card">
        <h2>County Parcel Viewer</h2>
        <form id="parcel-search-form" class="compact-row">
          <input id="parcel-search-input" type="search" placeholder="Parcel # or address" aria-label="Parcel search" />
          <button type="submit">Search</button>
        </form>

        <div class="compact-row">
          <label for="backend-select">Search backend</label>
          <select id="backend-select">
            <option value="wfs" ${state.searchBackend === "wfs" ? "selected" : ""}>WFS</option>
            <option value="ogcApiFeatures" ${state.searchBackend === "ogcApiFeatures" ? "selected" : ""}>OGC API Features</option>
          </select>
        </div>

        <section>
          <h3>Layers</h3>
          <div class="layer-list">${layersMarkup}</div>
        </section>

        ${loadingMarkup}
        ${errorMarkup}

        <section>
          <h3>Results</h3>
          <ul class="result-list">${resultsMarkup}</ul>
        </section>
      </div>`;
  }

  private attachEvents(): void {
    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement && target.dataset.layerId) {
        this.actions.onLayerToggle(target.dataset.layerId);
      }

      if (target instanceof HTMLSelectElement && target.id === "backend-select") {
        const value = target.value === "ogcApiFeatures" ? "ogcApiFeatures" : "wfs";
        this.actions.onBackendChange(value);
      }
    });

    this.root.addEventListener("submit", (event) => {
      if (!(event.target instanceof HTMLFormElement) || event.target.id !== "parcel-search-form") {
        return;
      }

      event.preventDefault();
      const input = this.root.querySelector<HTMLInputElement>("#parcel-search-input");
      const query = input?.value.trim() ?? "";
      if (query.length > 0) {
        this.actions.onSearchSubmit(query);
      }
    });
  }
}
