import { ParcelFeature, SearchBackend, SearchResult } from "../types";

export interface AppState {
  activeLayerIds: Set<string>;
  searchBackend: SearchBackend;
  searchResults: SearchResult[];
  selectedParcel: ParcelFeature | null;
  isLoading: boolean;
  errorMessage: string | null;
}

type Listener = (state: AppState) => void;

export class AppStore {
  private state: AppState;
  private readonly listeners = new Set<Listener>();

  public constructor(initialState: AppState) {
    this.state = initialState;
  }

  public getState(): AppState {
    return this.state;
  }

  public setState(updater: (state: AppState) => AppState): void {
    this.state = updater(this.state);
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
