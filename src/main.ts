import { appConfig } from "./config/appConfig";
import { LayerRegistry } from "./config/layerRegistry";
import { MapController } from "./map/mapController";
import { WfsParcelSearchService, OgcApiFeaturesSearchService, ParcelSearchService } from "./services/searchService";
import { formatParcelPopup } from "./services/popupFormatter";
import { AppStore } from "./state/store";
import { SidebarView } from "./ui/sidebar";

const layerRegistry = new LayerRegistry(appConfig.layers);
const mapController = new MapController();

const store = new AppStore({
  activeLayerIds: new Set(layerRegistry.getDefaultVisibleLayerIds()),
  searchBackend: "wfs",
  searchResults: [],
  selectedParcel: null,
  isLoading: false,
  errorMessage: null
});

const getSearchService = (): ParcelSearchService => {
  if (store.getState().searchBackend === "wfs") {
    return new WfsParcelSearchService(layerRegistry.getById("parcels"));
  }

  // TODO: Replace with your real OGC API Features collection endpoint.
  return new OgcApiFeaturesSearchService("https://your-qgis-server.example.org/ogc/collections/parcels");
};

const sidebarRoot = document.getElementById("sidebar");
if (!sidebarRoot) {
  throw new Error("Sidebar container #sidebar is required.");
}

const sidebar = new SidebarView(sidebarRoot, layerRegistry, {
  onLayerToggle: (layerId) => {
    store.setState((state) => {
      const next = new Set(state.activeLayerIds);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }

      return {
        ...state,
        activeLayerIds: next
      };
    });
  },
  onSearchSubmit: async (query) => {
    store.setState((state) => ({ ...state, isLoading: true, errorMessage: null }));

    try {
      const results = await getSearchService().search({ text: query, limit: 15 });
      store.setState((state) => ({
        ...state,
        searchResults: results,
        isLoading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected search error";
      store.setState((state) => ({
        ...state,
        isLoading: false,
        errorMessage: message
      }));
    }
  },
  onBackendChange: (backend) => {
    store.setState((state) => ({
      ...state,
      searchBackend: backend
    }));
  }
});

mapController.initializeOnce(appConfig.map.containerId, appConfig.map.center, appConfig.map.zoom);

store.subscribe((state) => {
  const activeLayers = [...state.activeLayerIds].map((id) => layerRegistry.getById(id));
  mapController.syncActiveLayers(activeLayers);
  sidebar.render(state);

  if (state.selectedParcel) {
    // Popup HTML is formatted from configurable field definitions.
    const popupHtml = formatParcelPopup(state.selectedParcel, appConfig.popup);
    console.debug("Parcel popup", popupHtml);
    mapController.zoomToParcel(state.selectedParcel);
  }
});
