/**
 * Sample strongly-typed configuration object for environments where
 * you do not want to rely solely on .env files.
 */
import type { AppConfig } from '../types/config';

export const sampleServiceConfig: AppConfig = {
  qgisBaseUrl: 'https://gis.examplecounty.gov/qgisserver',
  qgisProjectName: '/srv/qgis/projects/tax_parcels.qgz',
  parcelLayerName: 'tax_parcels',
  parcelLabelLayerName: 'tax_parcels_labels',
  externalWmsUrl: 'https://services.example.com/geoserver/wms',
  externalWmsLayerName: 'zoning:districts',
  printLayoutName: 'Tax_11x17_Landscape',
  initialCenter: [-104.9903, 39.7392],
  initialZoom: 13,
  searchableParcelField: 'parcel_id',
  identifyFields: ['parcel_id', 'owner_name', 'site_address', 'land_use', 'acreage'],
  searchEndpointUrl: 'https://gis.examplecounty.gov/ogc/collections/tax_parcels/items',
  projection: 'EPSG:3857'
};
