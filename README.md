# WJYA-GIS - County Parcel Viewer

Indiana County, PA parcel viewer built on QGIS Server (WMS/WFS) with a React + OpenLayers frontend.

## Quick Start

### Prerequisites

- Docker Desktop running
- PowerShell

### 1. Start QGIS Server

```powershell
docker compose up -d
```

This starts QGIS Server on port `9090`, serving `PARCELS.qgz` from the configured data volume.

### 2. Start the app

```powershell
& 'workpc\serve-local-viewer.ps1'
```

Open `http://localhost:4173` in your browser.

## Project Structure

```
WJYA-GIS/
  docker-compose.yml        # QGIS Server container config
  app/                      # Built app (parallel copy)
    app-config.json          # Runtime config
    index.html
    assets/
  workpc/                   # Active served app
    serve-local-viewer.ps1   # Local dev server with /qgis/ proxy
    app/
      app-config.json        # Runtime config
      index.html
      assets/
  HANDOFF.md                # Detailed history of fixes and decisions
  WORKPC-SETUP.md           # Work PC setup instructions
  CLAUDE-CODE-PROMPT.md     # Original build prompt
  test_map.html             # Standalone WMS test page
```

## Architecture

- **WMS** for parcel map display (fast, server-rendered tiles)
- **WFS** for search, identify, and selected parcel highlighting
- **Browser print** of the live map (includes basemaps/imagery)
- **PowerShell server** proxies `/qgis/` to QGIS Server on `:9090` (avoids CORS)

## Configuration

Runtime config is in `workpc/app/app-config.json`. Key values:

| Key | Current Value |
|-----|---------------|
| `VITE_QGIS_BASE_URL` | `/qgis/ows/` |
| `VITE_PARCEL_LAYER_NAME` | `INDCO_c25527e7_d1da_4237_807c_58698b4cff7d` |
| `VITE_PARCEL_LABEL_LAYER_NAME` | `INDCO_dead94cf_23dd_4b8f_a147_35cdcea08b4d` |
| `VITE_SEARCH_TYPENAME` | `INDCO` |
| `VITE_SEARCH_PROVIDER` | `wfs` |

## User Instructions

1. Open the Parcel Viewer at `http://localhost:4173`
2. Search by parcel ID, owner name, or deed reference
3. Click a parcel on the map to see details
4. Toggle imagery or labels as needed
5. Click **Print Current Map**, then choose 11x17 Landscape in the browser print dialog

## Data

Parcel data is **not** in this repo. The QGIS project and GeoPackage are mounted into Docker from:

```
D:\OneDrive - Young & Associates\Documents\parcels\
  PARCELS.qgz
  INDCO.gpkg
```

To change the data path, edit the volume mount in `docker-compose.yml`.
