import type { Coordinate } from 'ol/coordinate';
import type { IdentifyPopupData, PopupRow } from '../types/parcel';
import type { PopupConfig, PopupFieldConfig } from '../types/config';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const acreageFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const readScalarValue = (value: unknown): string | number | null =>
  typeof value === 'string' || typeof value === 'number' ? value : null;

const formatValue = (value: string | number | null, field: PopupFieldConfig, emptyValueText: string): string => {
  if (value === null || value === '') {
    return field.emptyText ?? emptyValueText;
  }

  if (field.format === 'currency' && typeof value === 'number') {
    return currencyFormatter.format(value);
  }

  if (field.format === 'acreage' && typeof value === 'number') {
    return acreageFormatter.format(value);
  }

  if (field.format === 'number' && typeof value === 'number') {
    return numberFormatter.format(value);
  }

  return String(value);
};

export const buildIdentifyPopup = (
  properties: Record<string, unknown>,
  coordinate: Coordinate,
  popupConfig: PopupConfig
): IdentifyPopupData => {
  const titleValue = readScalarValue(properties[popupConfig.titleField]);
  const rows: PopupRow[] = popupConfig.fields.map((field) => {
    const scalarValue = readScalarValue(properties[field.field]);

    return {
      label: field.label,
      value: formatValue(scalarValue, field, popupConfig.emptyValueText)
    };
  });

  return {
    title: titleValue ? String(titleValue) : 'Parcel',
    rows,
    coordinate: [coordinate[0], coordinate[1]]
  };
};
