# Claude Code Prompt: Indiana County Parcel Viewer

Build me a web-based parcel viewer app from scratch. This app connects to a QGIS Server running in Docker that serves Indiana County, PA parcel data via WMS and WFS.

## Tech Stack

- **Vite + React 19 + TypeScript**
- **OpenLayers** for the map (latest version)
- **Tailwind CSS** for styling
- No other UI frameworks needed. Keep it clean and simple.

## QGIS Server Details

The QGIS Server is already running and accessible. Here are the exact endpoints and layer names:

- **Base OWS URL:** `http://localhost:9090/ows/`
- **QGIS Project File (MAP parameter):** `/io/data/PARCELS.qgz`
- **WMS Layer Name:** `INDCO_c25527e7_d1da_4237_807c_58698b4cff7d`
- **WFS Layer Name (typename):** `INDCO`
- **WFS Version:** `1.1.0`
- **Supported CRS:** EPSG:3857, EPSG:2272, CRS:84

### Working WMS GetMap Example

```
http://localhost:9090/ows/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&MAP=/io/data/PARCELS.qgz&LAYERS=INDCO_c25527e7_d1da_4237_807c_58698b4cff7d&CRS=EPSG:4326&BBOX=40,-80,41,-78&WIDTH=800&HEIGHT=600&FORMAT=image/png
```

### Working WFS GetFeature Example

```
http://localhost:9090/ows/?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&MAP=/io/data/PARCELS.qgz&TYPENAME=INDCO&MAXFEATURES=1&outputFormat=application/json
```

### Important Notes About This QGIS Server

- The `MAP=/io/data/PARCELS.qgz` parameter **must** be included in every WMS and WFS request, otherwise the server won't know which project to load.
- WMS uses the long layer name with UUID: `INDCO_c25527e7_d1da_4237_807c_58698b4cff7d`
- WFS uses the short layer name: `INDCO`
- The server is QGIS Server (not GeoServer), so WFS filter syntax uses `EXP_FILTER` with double-quoted field names, e.g. `EXP_FILTER="PARCEL"='39-001-130'`
- For WFS searches, use `MAXFEATURES` (not `count`) and `TYPENAME` (not `typeNames`)
- The server supports `outputFormat=application/json` for GeoJSON responses

## Parcel Data Fields

Each parcel feature has these key fields (among many others):

| Field | Description | Example Value |
|-------|-------------|---------------|
| `PARCEL` | Parcel number (primary ID for search) | `39-001-130` |
| `SHORT_NAME` | Owner name | `BUFFALO + SUSQUEHANNA` |
| `DEED_REF` | Deed reference | `DB 100 PG 200` |
| `ADDRESS_1` | Street address | `1060 WAYNE AVE` |
| `CITY` | City | `INDIANA` |
| `STATE` | State | `PA` |
| `ZIP` | Zip code | `15701-2951` |
| `ACRES` | Acreage | `33.0` |
| `DEEDED_ACR` | Deeded acreage | `33.0` |
| `LAND_USE_C` | Land use code | `113` |
| `NEW_MV_TOT` | Total market value | `52100` |
| `NEW_MV_LAN` | Land market value | `52100` |
| `NEW_MV_BLD` | Building market value | `0` |
| `SALE_DATE` | Last sale date | (can be null) |
| `SALE_PRICE` | Last sale price | (can be null) |
| `MAP_` | Map number | `001-130` |
| `DISTRICT_N` | District number | `39` |
| `SCHOOL_DIS` | School district code | `7` |
| `PROPERTY_T` | Property type | `V` (vacant) |
| `PARCEL_ID` | Full parcel ID with suffixes | `39-001-130.00..-000` |

## App Features

### 1. Map Display

- Full-screen map using OpenLayers with EPSG:3857 projection
- Initial center on Indiana County, PA: longitude `-79.15`, latitude `40.62`, zoom level `10`
- Parcel boundaries displayed as a WMS image layer from the QGIS Server
- OpenStreetMap as the default basemap
- Include a satellite/imagery basemap option (use any free tile source)
- Basemap switcher in the sidebar
- Standard map controls: zoom buttons, scale bar, mouse position (lat/lon)

### 2. Sidebar Panel

- Fixed-width sidebar on the left side (~340-360px)
- Contains: app title, basemap switcher, layer toggles, parcel search, and action buttons
- Should scroll if content overflows
- Clean, modern design

### 3. Parcel Search

- Text input field where the user types a parcel number (e.g. `39-001-130`)
- Searches via WFS against the QGIS Server using `EXP_FILTER`
- Display results as clickable cards showing parcel number and owner name
- When a result is clicked, zoom the map to that parcel's extent
- Show loading state while searching
- Show error messages if the search fails
- Limit results to 10

### 4. Parcel Identify (Click on Map)

- When the user clicks on the map, send a WMS GetFeatureInfo request to identify the parcel at that location
- Use `INFO_FORMAT=application/json` and `QUERY_LAYERS=INDCO_c25527e7_d1da_4237_807c_58698b4cff7d`
- Display parcel details in a popup overlay anchored to the click location
- Popup should show: Parcel Number, Owner Name, Address, City/State/Zip, Acreage, Market Value, Deed Reference
- Include a close button on the popup
- Format currency values with dollar signs and commas
- Show "N/A" for null or empty values

### 5. Layer Controls

- Toggle the parcel WMS layer on/off
- Opacity is fine at 100% for parcels

### 6. Reset View Button

- Button in the sidebar that resets the map to the initial center and zoom

## Configuration

Store all QGIS Server URLs, layer names, field mappings, and initial map settings in a single config file (`src/config.ts` or similar) so they're easy to change later without digging through components. The config should include:

```typescript
const config = {
  qgisBaseUrl: "http://localhost:9090/ows/",
  qgisProjectFile: "/io/data/PARCELS.qgz",
  wmsLayerName: "INDCO_c25527e7_d1da_4237_807c_58698b4cff7d",
  wfsTypeName: "INDCO",
  wfsVersion: "1.1.0",
  initialCenter: [-79.15, 40.62] as [number, number],
  initialZoom: 10,
  projection: "EPSG:3857",
  searchField: "PARCEL",
  maxSearchResults: 10,
  popup: {
    titleField: "PARCEL",
    fields: [
      { field: "SHORT_NAME", label: "Owner" },
      { field: "ADDRESS_1", label: "Address" },
      { field: "CITY", label: "City" },
      { field: "ZIP", label: "Zip" },
      { field: "ACRES", label: "Acres" },
      { field: "NEW_MV_TOT", label: "Market Value", format: "currency" },
      { field: "DEED_REF", label: "Deed Ref" },
      { field: "LAND_USE_C", label: "Land Use" },
      { field: "SALE_DATE", label: "Last Sale" },
      { field: "SALE_PRICE", label: "Sale Price", format: "currency" },
    ],
  },
};
```

## Helper Function for Building QGIS Server URLs

Every request to the QGIS Server needs the MAP parameter appended. Create a utility function like:

```typescript
function buildQgisUrl(params: Record<string, string>): string {
  const url = new URL(config.qgisBaseUrl);
  url.searchParams.set("MAP", config.qgisProjectFile);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}
```

## CORS Note

The app will run on `localhost:4173` or `localhost:5173` and the QGIS Server is on `localhost:9090`. Cross-origin requests may be blocked by the browser. The user has a CORS browser extension installed, so don't worry about adding a proxy — just make direct fetch calls. But do add a comment in the README noting that a CORS extension or proxy is needed for local development.

## Design Style

- Clean and professional, similar to a county GIS viewer
- Light color scheme with a subtle accent color (dark green/teal works well for GIS apps)
- Use CSS variables for theming
- Sidebar should have card-based sections with subtle shadows
- Map should fill all remaining space
- Responsive: on narrow screens, stack the sidebar above the map

## Project Structure

Keep it organized:

```
src/
├── config.ts              # All configuration in one place
├── App.tsx                # Main app layout
├── main.tsx               # Entry point
├── index.css              # Tailwind + custom CSS
├── components/
│   ├── MapView.tsx        # OpenLayers map component
│   ├── Sidebar.tsx        # Sidebar container
│   ├── BasemapSwitcher.tsx
│   ├── LayerControls.tsx
│   ├── ParcelSearch.tsx
│   ├── SearchResults.tsx
│   ├── ParcelPopup.tsx
│   └── MapActions.tsx
├── hooks/
│   ├── useMap.ts          # Map initialization and management
│   ├── useParcelSearch.ts # WFS search logic
│   ├── useParcelIdentify.ts # WMS GetFeatureInfo logic
│   └── useBasemap.ts
└── utils/
    ├── qgis.ts            # QGIS Server URL builders and request helpers
    └── format.ts          # Value formatting (currency, etc.)
```

## What NOT to Include

- No authentication/login
- No print/PDF generation
- No drawing tools
- No feature editing
- No address geocoding (parcel search only)
- No routing
- Don't over-engineer it — keep it straightforward

## Final Notes

- Make sure the app works immediately after `npm install && npm run dev` with no additional setup beyond having the QGIS Server running on port 9090
- All QGIS Server requests must include the `MAP` parameter
- Test that WMS tiles actually appear on the map — this was the hardest part to get working
- The WMS and WFS layer names are DIFFERENT — don't mix them up
- Give me complete, ready-to-run files. Don't give me snippets to stitch together.
