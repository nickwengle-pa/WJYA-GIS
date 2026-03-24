import { AppConfig } from "../types";

export const appConfig: AppConfig = {
  map: {
    containerId: "map",
    center: [47.6062, -122.3321],
    zoom: 13
  },
  popup: {
    titleField: "parcel_number",
    fields: [
      { key: "parcel_number", label: "Parcel #" },
      { key: "site_address", label: "Address", fallback: "No address" },
      {
        key: "assessed_value",
        label: "Assessed Value",
        formatter: (value) => {
          if (typeof value !== "number") {
            return "N/A";
          }

          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
          }).format(value);
        }
      },
      { key: "land_use", label: "Land Use", fallback: "Unknown" },
      { key: "owner_name", label: "Owner", fallback: "Not available" }
    ]
  },
  layers: [
    {
      id: "parcels",
      label: "Tax Parcels",
      // TODO: Replace with your real QGIS Server WMS/WFS endpoint.
      sourceUrl: "https://your-qgis-server.example.org/qgis",
      // TODO: Replace with your real QGIS layer name (workspace:layer).
      typeName: "county:parcels",
      visibleByDefault: true,
      style: {
        color: "#2d6a4f",
        weight: 1,
        fillColor: "#95d5b2",
        fillOpacity: 0.25
      }
    },
    {
      id: "zoning",
      label: "Zoning",
      // TODO: Replace with your real QGIS Server WMS/WFS endpoint.
      sourceUrl: "https://your-qgis-server.example.org/qgis",
      // TODO: Replace with your real QGIS layer name (workspace:layer).
      typeName: "county:zoning",
      visibleByDefault: false,
      style: {
        color: "#6c757d",
        weight: 1,
        fillColor: "#adb5bd",
        fillOpacity: 0.15
      }
    }
  ]
};
