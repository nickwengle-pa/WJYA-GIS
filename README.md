# Tax Parcel Viewer Starter (React + Vite + TypeScript + OpenLayers)

Production-oriented starter web GIS app for viewing tax parcels from QGIS Server services.

## Features

- Full-screen responsive web map layout.
- Left sidebar with:
  - basemap selector
  - aerial imagery toggle
  - parcel boundary toggle
  - parcel labels toggle (separate labeled WMS layer)
  - external WMS overlay toggle
  - parcel ID search box
  - print button (11x17 PDF via QGIS GetPrint)
  - reset view button
- OpenLayers map with:
  - scale line
  - optional mouse coordinates
  - parcel identify popup via GetFeatureInfo
- Search abstraction:
  - uses OGC API Features/WFS-like endpoint when configured
  - mock fallback when search endpoint is unavailable
- Environment-based configuration for all important endpoints/layers.

## Project Structure

```text
src/
  components/
    LayerControls.tsx
    MapView.tsx
    ParcelPopup.tsx
    PrintButton.tsx
    SearchPanel.tsx
    Sidebar.tsx
  hooks/
    useMap.ts
    useParcelIdentify.ts
    useParcelSearch.ts
    usePrint.ts
  services/
    config.ts
    layerFactory.ts
    parcelSearch.ts
    printService.ts
    qgisWms.ts
    sampleServiceConfig.ts
  types/
    config.ts
    parcel.ts
    qgis.ts
  utils/
    extent.ts
    url.ts
  App.tsx
  main.tsx
```

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

## Build (production)

```bash
npm run build
```

## Configure `.env`

1. Copy `.env.example` to `.env`.
2. Update each variable for your environment:
   - `VITE_QGIS_BASE_URL`: QGIS server URL (without hardcoded request params).
   - `VITE_QGIS_PROJECT_NAME`: project path/name used by QGIS Server `MAP` parameter.
   - `VITE_PARCEL_LAYER_NAME`: unlabeled parcel boundary layer.
   - `VITE_PARCEL_LABEL_LAYER_NAME`: pre-labeled parcel layer.
   - `VITE_EXTERNAL_WMS_URL`, `VITE_EXTERNAL_WMS_LAYER_NAME`: optional overlay source.
   - `VITE_PRINT_LAYOUT_NAME`: print layout name in QGIS project.
   - `VITE_INITIAL_CENTER`, `VITE_INITIAL_ZOOM`: starting map position.
   - `VITE_SEARCHABLE_PARCEL_FIELD`: parcel ID field used in search/popup title.
   - `VITE_IDENTIFY_FIELDS`: comma-separated fields for identify popup.
   - `VITE_SEARCH_ENDPOINT_URL`: optional OGC API Features / WFS endpoint.

## Expected QGIS Server setup

- Parcel layers must be published in the target QGIS project.
- Layer names must exactly match configured environment variables.
- GetFeatureInfo must be enabled for parcel boundary layer.
- A print layout must exist in the QGIS project with the exact template name in `VITE_PRINT_LAYOUT_NAME`.
- Print output is requested as `FORMAT=pdf` and uses the current map extent.

## Print layout requirements

- Layout should be configured for **11x17 landscape** in QGIS Desktop.
- Recommended layout name: `Tax_11x17_Landscape` (or update `.env`).
- Ensure map item naming and extent behavior in layout match your print workflow.

## Search endpoint expectations

- Prefer OGC API Features endpoint (recommended).
- Response should include geometry or bbox so the app can zoom to the result.
- If no search endpoint is configured, app falls back to a mock service abstraction.

## External WMS note

External WMS layers may need to be **cascaded/embedded in the QGIS project** for consistent print support via QGIS GetPrint.

## Next steps for production hardening

1. Add authentication and token refresh handling for protected GIS services.
2. Add robust error boundary + user notifications.
3. Implement stronger search filters (exact, partial, owner, address).
4. Add loading indicators and retry/backoff for unstable services.
5. Add automated tests (unit + integration + Playwright map smoke tests).
6. Add centralized logging/telemetry.
7. Validate/escape all user input and handle non-standard service responses.
8. Add CI/CD pipeline and environment-specific build configs.

## Notes

- Basemap/aerial URLs in `layerFactory.ts` are placeholders and should be replaced with organization-approved services.
- This starter is designed to make endpoint swapping easy through `.env` only.
