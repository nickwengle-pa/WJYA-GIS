import { ParcelFeature, PopupConfig } from "../types";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const formatParcelPopup = (feature: ParcelFeature, config: PopupConfig): string => {
  const titleValue = feature.properties[config.titleField];
  const title = titleValue == null ? "Parcel" : String(titleValue);

  const rows = config.fields
    .map((field) => {
      const rawValue = feature.properties[field.key] ?? null;
      const rendered = rawValue == null
        ? field.fallback ?? "N/A"
        : field.formatter?.(rawValue) ?? String(rawValue);

      return `<tr><th>${escapeHtml(field.label)}</th><td>${escapeHtml(rendered)}</td></tr>`;
    })
    .join("");

  return `<section class=\"parcel-popup\"><h3>${escapeHtml(title)}</h3><table>${rows}</table></section>`;
};
