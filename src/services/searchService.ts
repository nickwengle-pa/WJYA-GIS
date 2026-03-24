import { LayerConfig, SearchQuery, SearchResult, ServiceError } from "../types";

export interface ParcelSearchService {
  search(query: SearchQuery): Promise<SearchResult[]>;
}

const ensureOk = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    const text = await response.text();
    throw new ServiceError(`Search request failed: ${text || response.statusText}`, response.status);
  }

  return response;
};

const toSummary = (parcelId: string, address?: unknown): string => {
  const asString = typeof address === "string" && address.length > 0 ? address : "Address unavailable";
  return `${parcelId} — ${asString}`;
};

export class WfsParcelSearchService implements ParcelSearchService {
  public constructor(private readonly layer: LayerConfig) {}

  public async search(query: SearchQuery): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeNames: this.layer.typeName,
      outputFormat: "application/json",
      count: String(query.limit ?? 10),
      // TODO: Update property names once your real QGIS fields are known.
      cql_filter: `parcel_number ILIKE '%${query.text.replaceAll("'", "''")}%' OR site_address ILIKE '%${query.text.replaceAll("'", "''")}%'`
    });

    const response = await ensureOk(await fetch(`${this.layer.sourceUrl}?${params.toString()}`));
    const payload = (await response.json()) as {
      features?: Array<{ properties?: Record<string, unknown> }>;
    };

    return (payload.features ?? []).map((feature) => {
      const parcelId = String(feature.properties?.parcel_number ?? "Unknown Parcel");
      return {
        parcelId,
        summary: toSummary(parcelId, feature.properties?.site_address)
      };
    });
  }
}

export class OgcApiFeaturesSearchService implements ParcelSearchService {
  public constructor(private readonly collectionUrl: string) {}

  public async search(query: SearchQuery): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      limit: String(query.limit ?? 10),
      q: query.text
    });

    const response = await ensureOk(await fetch(`${this.collectionUrl}/items?${params.toString()}`));
    const payload = (await response.json()) as {
      features?: Array<{ properties?: Record<string, unknown> }>;
    };

    return (payload.features ?? []).map((feature) => {
      const parcelId = String(feature.properties?.parcel_number ?? "Unknown Parcel");
      return {
        parcelId,
        summary: toSummary(parcelId, feature.properties?.site_address)
      };
    });
  }
}
