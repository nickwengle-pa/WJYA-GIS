# County Parcel Viewer Handoff

Last updated: 2026-03-31

## Purpose

This document summarizes the work completed to get the county parcel web app into a working state, including the main fixes, current architecture, key files, and recommended next steps for internal rollout.

## Current Outcome

The app is now in a usable working state with:

- parcel outlines loading correctly
- parcel click/identify working
- parcel search working
- targeted WFS highlighting for clicked/searched parcels
- browser-based print working with the live visible map
- QGIS Desktop basemap/imagery workflow integrated into the project
- parcel labels available as a separate toggle
- better search performance after indexing and staged search logic
- improved UI compared with the original raw layout

## Main Problems We Started With

Initial issues reported:

- clicking parcels returned a PNG/JSON parsing error
- search did not work
- WFS usage was unclear/incomplete
- print returned template errors or blank output
- imagery/basemaps did not print through the original QGIS print flow
- overall performance felt very slow
- labels were not set up as a clean separate toggle

## High-Level Architecture

### Current local/dev architecture

- QGIS Server runs in Docker on port `9090`
- a local PowerShell app server serves the packaged frontend on port `4173`
- the frontend uses a same-origin `/qgis/` proxy to avoid browser CORS issues
- the main rendered parcel layer is WMS
- WFS is used for search, lookup, and selected parcel highlighting
- print now uses browser print of the live map, not QGIS `GetPrint`

### Important distinction

The app copy currently used for local serving is the `workpc` copy:

- `workpc/app/...`
- `workpc/serve-local-viewer.ps1`

There is also a parallel copy under:

- `app/...`

Most important fixes were mirrored to both, but the `workpc` copy is the one to treat as the active served app unless intentionally changed.

## Key Files

### Active local app

- `workpc/serve-local-viewer.ps1`
- `workpc/app/index.html`
- `workpc/app/app-config.json`
- `workpc/app/assets/App-BpB3PJCm.js`
- `workpc/app/assets/index-CwHfdBQz.css`

### Supporting app copy

- `app/app-config.json`
- `app/assets/App-BpB3PJCm.js`

### QGIS Server / infrastructure

- `docker-compose.yml`

### QGIS project and data

- `D:\OneDrive - Young & Associates\Documents\parcels\PARCELS.qgz`
- `D:\OneDrive - Young & Associates\Documents\parcels\INDCO.gpkg`

## What Was Changed

## 1. Local app server and proxy

We updated the PowerShell server to:

- serve the frontend locally
- proxy `/qgis/` requests to QGIS Server on `127.0.0.1:9090`
- rewrite `app-config.json` at runtime so the frontend uses the same host/port as the viewer
- disable browser caching with `Cache-Control: no-store`
- explicitly load `System.Net.Http` to avoid the `HttpClientHandler` type error in PowerShell

Result:

- browser requests now go through the local viewer server instead of directly to `:9090`
- this resolved the cross-origin issues that were breaking search and identify

## 2. Identify/click fix

Root cause:

- the click identify request was effectively being sent as `GetMap`, so QGIS returned a PNG instead of JSON

Fix:

- removed the bad request parameter inheritance in the app bundle

Result:

- click identify now returns usable JSON and parcel detail popup data

## 3. WFS strategy

We explicitly kept a hybrid architecture:

- WMS for parcel map display
- WFS for search and selected parcel geometry

This was chosen because full-map WFS rendering would be heavier and slower for a parcel viewer.

We then added:

- search-result geometry highlighting
- click-based parcel highlight lookup
- automatic clearing of highlight when selection is cleared

Result:

- the map stays fast enough for viewing
- WFS is used where it provides the most value

## 4. Search fixes and improvements

Search was updated to:

- work through the same-origin proxy
- use QGIS WFS GeoJSON output
- search by parcel ID, owner, and deed reference
- avoid the old geometry projection problem that caused `Cannot fit empty extent provided as geometry`

Search behavior was later optimized further:

- exact/prefix parcel-style queries are tried first
- owner/deed lookups use prefix search instead of broad `%contains%`
- searches first request only the needed fields
- geometry is fetched only when needed for zoom/highlight

Result:

- search works
- exact parcel search is much faster
- owner/deed search is more controlled and less expensive

## 5. Print fixes

Original print issues:

- QGIS `GetPrint` template mismatch
- blank PDFs due to extent/projection mismatch
- browser basemaps and imagery were not included in QGIS Server PDF output

What happened:

- we fixed the print template name mismatch
- we fixed the print extent/projection issue
- even after that, server-side print still did not reliably include browser basemaps/external imagery

Final decision:

- switch printing to browser-side live map print

Result:

- print now reflects what the user sees on screen
- if imagery or OSM is visible, it is included in print
- page size/orientation is now controlled by the browser print dialog

Recommended user instruction:

- click `Print Current Map`
- choose `11x17`
- choose `Landscape`

## 6. Basemaps and imagery

We moved away from treating browser-only basemaps as the long-term answer and instead aligned the project with QGIS Desktop where useful.

Work completed:

- PASDA imagery was tested and wired in as an app basemap
- user then added OSM / imagery / terrain sources directly in QGIS Desktop
- QGIS themes were discussed, but final print solution ended up using browser print instead

Current practical state:

- basemap behavior is usable in the web app
- print shows what is on screen because printing is browser-side

## 7. Parcel labels

The app already had a `Parcel Labels` layer toggle, but it originally pointed to the same QGIS layer as the parcel outlines.

To fix that cleanly:

- a duplicate layer was created in QGIS Desktop: `INDCO Labels`
- that duplicate was styled as a label-only layer
- the app config was updated so `VITE_PARCEL_LABEL_LAYER_NAME` points to the new QGIS layer ID:
  - `INDCO_dead94cf_23dd_4b8f_a147_35cdcea08b4d`

Result:

- parcel labels can now be toggled separately from parcel outlines
- labels also participate in print because browser print uses the visible map

## 8. UI improvements

We made a UI pass to make the app feel more usable and more map-first.

Improvements included:

- stronger map-first layout
- floating/focused left control rail
- better search result cards
- selected parcel summary card
- clearer basemap controls
- better styling for popup/cards/buttons
- print note explaining browser print behavior

The app is not a full design-system app, but it is significantly more polished than the starting point.

## 9. Performance improvements

We inspected the parcel dataset and found the main bottleneck was not just Docker. Important findings:

- parcel dataset size was reasonable for this use case
- there was initially no spatial index
- attribute indexes were missing or ineffective for the original broad search pattern
- Docker was reading from a OneDrive-backed bind mount, which is not ideal for production

Actions taken:

- spatial index was created on `INDCO`
- attribute indexes were created
- search logic was changed to use staged parcel-first and prefix matching
- click/highlight logic was reduced to fewer heavy requests

Result:

- the app became noticeably faster

## Infrastructure State Right Now

### Docker

Current compose file:

- `docker-compose.yml` (repo root)

Current pattern:

- QGIS Server container on `9090`
- project/data mounted from:
  - `D:/OneDrive - Young & Associates/Documents/parcels:/io/data:ro`

### Local run command

Current local viewer run command:

```powershell
& 'workpc\serve-local-viewer.ps1'
```

Then open:

- `http://localhost:4173`

## Current Config Highlights

From the active `workpc` config:

- parcel WMS layer:
  - `INDCO_c25527e7_d1da_4237_807c_58698b4cff7d`
- parcel label layer:
  - `INDCO_dead94cf_23dd_4b8f_a147_35cdcea08b4d`
- search provider:
  - `wfs`
- search typename:
  - `INDCO`
- map projection:
  - `EPSG:3857`

## Important Lessons / Decisions

### Why we kept WMS for the parcel layer

For a county parcel viewer, WMS is the better default display layer because:

- it is lighter in the browser
- it avoids pulling all parcel geometry to the client
- it works better as a general display layer

WFS is still used where it matters:

- search
- selected parcel geometry
- highlighting

### Why print is browser-based now

QGIS Server print was workable for parcel-only output but not dependable for matching the full on-screen map with browser basemaps/external imagery.

Browser print was chosen because it:

- matches what the user sees
- includes visible basemaps and imagery
- is simpler for this app's intended use

## Recommended Production Direction

For company rollout, the recommended architecture is:

- GitHub for source control
- one always-on internal Windows server or VM
- QGIS Server in Docker
- static frontend served by a proper web server/reverse proxy
- local disk storage for `PARCELS.qgz` and `INDCO.gpkg`
- optional Cloudflare Tunnel + Access if remote access is needed

Recommended production improvements:

- move the live parcel data out of OneDrive
- host the app on one shared internal URL
- replace the local PowerShell server with a proper production reverse proxy/static host
- keep browser print as the end-user print workflow unless requirements change

## What Is Still Rough / Worth Revisiting Later

- production hosting is still local/dev-style, not yet a formal shared deployment
- live data is still referenced from OneDrive-backed storage
- browser print is simpler and effective, but it is not a template-driven cartographic print workflow
- labels are intentionally kept limited because the map gets busy quickly

## Suggested Next Steps

### For internal rollout

1. Move `PARCELS.qgz` and `INDCO.gpkg` to a normal local server folder such as `D:\gis-data\parcels`
2. Update the Docker volume path
3. Host the app behind IIS/Caddy/Nginx on an internal URL
4. Pilot with a few internal users
5. Add remote access later only if needed

### For documentation / operations

1. Keep parcel data out of the repo
2. Document the update process for project/style/data changes
3. Document the standard user print flow

## Quick User Instructions

For a normal user:

1. Open the Parcel Viewer
2. Search by parcel ID, owner, or deed
3. Click a parcel to inspect details
4. Toggle imagery or labels if needed
5. Click `Print Current Map`
6. In the browser print dialog, choose `11x17` and `Landscape`

## Summary

The app is now a working internal parcel viewer with:

- functioning identify
- functioning search
- stable highlighting
- usable basemaps
- usable print workflow
- separate parcel labels
- noticeably better performance

The biggest remaining work is no longer app debugging. It is operationalizing the app for company-wide use on a shared hosted server.
