# County Parcel Viewer

Lean React + TypeScript + OpenLayers parcel viewer structured for a realistic county GIS deployment backed by QGIS Server.

## What changed

- Config-driven basemap and layer registry in `src/config/`.
- Stronger TypeScript models for basemaps, operational layers, popup fields, and pluggable search providers.
- Sidebar redesigned into compact county-viewer controls with search results and status banners.
- Map lifecycle kept stable so layer toggles, search, print, and identify do not reinitialize the map.
- Popup rows formatted from configurable field definitions instead of dumping raw attributes.
- Search service supports `mock`, `ogcApiFeatures`, or `wfs` modes without adding dependencies.

## Project structure

```text
src/
  components/
    LayerControls.tsx
    MapView.tsx
    ParcelPopup.tsx
    PrintButton.tsx
    SearchPanel.tsx
    Sidebar.tsx
  config/
    appConfig.ts
    layerRegistry.ts
  hooks/
    useMap.ts
    useParcelIdentify.ts
    useParcelSearch.ts
    usePrint.ts
  services/
    layerFactory.ts
    parcelSearch.ts
    popupFormatter.ts
    printService.ts
    qgisWms.ts
  types/
    config.ts
    parcel.ts
    qgis.ts
  utils/
    url.ts
  App.tsx
  main.tsx
```

## Environment setup

1. Copy `.env.example` to `.env`.
2. Replace the sample QGIS Server values with your county values.
3. Decide which search provider you are using:
   - `ogcApiFeatures`: recommended when you have an OGC API Features endpoint.
   - `wfs`: use when your parcel search is exposed as WFS.
   - `mock`: keeps the UI usable before the real service is wired.

## Layer registry

The operational layers and basemaps are defined in `src/config/layerRegistry.ts`.

- Replace the sample imagery URL with the county-approved imagery service.
- Keep parcel boundaries and parcel labels as separate QGIS-published layers.
- Leave the external zoning WMS blank in `.env` if you do not have that overlay yet.

## Popup formatting

Popup fields are configured in `src/config/appConfig.ts`.

- Replace the sample field names with the exact attribute names exposed by your parcel layer.
- Use the built-in field formats such as `text`, `number`, `currency`, and `acreage`.

## Search providers

`src/services/parcelSearch.ts` selects a provider from config:

- `ogcApiFeatures` builds a simple `filter` request against the configured items endpoint.
- `wfs` builds a QGIS Server `GetFeature` request using `MAP`, `TYPENAME`, `MAXFEATURES`, and `EXP_FILTER`.
- `mock` returns sample results without network dependency.

## Build

```bash
npm install
npm run build
```

## Notes

- The sample basemap, imagery, and external overlay URLs are placeholders.
- Comments in `.env.example`, `src/config/appConfig.ts`, and `src/config/layerRegistry.ts` mark the places where real county QGIS values need to go.
- No extra runtime dependencies were added beyond React and OpenLayers.
