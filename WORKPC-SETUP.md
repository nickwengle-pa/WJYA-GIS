# Work PC Setup

1. Unzip the package.
2. Open `app\app-config.json`.
3. Review `app\app-config.json`. It is now mostly prefilled for your current Docker/QGIS setup.

Use these URLs on the work PC:

- Recommended OWS endpoint: `http://localhost:9090/ows/`
- Working WFS example: `http://localhost:9090/ows/?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=parcels_-_indiana_county_parcels&OUTPUTFORMAT=application/json`
- WMS should use the same `/ows/` endpoint with WMS parameters.

Edit these keys in `app-config.json`:

- `VITE_QGIS_BASE_URL`
- `VITE_QGIS_PROJECT_NAME`
- `VITE_PARCEL_LAYER_NAME`
- `VITE_PARCEL_LABEL_LAYER_NAME`
- `VITE_SEARCH_URL`
- `VITE_SEARCH_TYPENAME`

Current prefilled values:

- `VITE_QGIS_BASE_URL`: `http://localhost:9090/ows/`
- `VITE_QGIS_PROJECT_NAME`: blank by default because your `/ows/` endpoint appears to already be project-bound
- `VITE_PARCEL_LAYER_NAME`: `parcels_-_indiana_county_parcels`
- `VITE_PARCEL_LABEL_LAYER_NAME`: `parcels_-_indiana_county_parcels`
- `VITE_SEARCH_URL`: `http://localhost:9090/ows/`
- `VITE_SEARCH_TYPENAME`: `parcels_-_indiana_county_parcels`
- `VITE_SEARCH_WFS_VERSION`: `1.1.0`

For a QGIS Server WFS setup on localhost, the app should usually use:

- `VITE_QGIS_BASE_URL`: `http://localhost:9090/ows/`
- `VITE_SEARCH_URL`: `http://localhost:9090/ows/`
- `VITE_SEARCH_PROVIDER`: `wfs`
- `VITE_SEARCH_WFS_VENDOR`: `qgis`
- `VITE_SEARCH_WFS_VERSION`: `1.1.0`

4. Save `app-config.json`.
5. Run `serve-local-viewer.ps1`.
6. Open `http://localhost:4173`.

Notes:

- `app-config.json` is runtime config. You do not need to rebuild the app just to change localhost URLs.
- Your current preferred service endpoint is `http://localhost:9090/ows/`, so the package is prefilled to use that OWS URL for both WMS and WFS.
- Leave `VITE_QGIS_PROJECT_NAME` blank unless your QGIS Server setup specifically requires a `MAP=` parameter.
- If your QGIS project uses different field names, update `VITE_SEARCHABLE_PARCEL_FIELD`, `VITE_OWNER_NAME_FIELD`, and `VITE_DEED_REFERENCE_FIELD`.
- Print depends on your QGIS Server print layout name matching `VITE_PRINT_LAYOUT_NAME`.
