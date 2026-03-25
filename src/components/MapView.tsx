import type { RefObject } from 'react';

interface MapViewProps {
  mapContainerRef: RefObject<HTMLDivElement | null>;
  isMapReady: boolean;
}

const MapView = ({ mapContainerRef, isMapReady }: MapViewProps) => (
  <div className="map-container" ref={mapContainerRef}>
    <div className={`map-loading ${isMapReady ? 'hidden' : ''}`}>Loading parcel map...</div>
  </div>
);

export default MapView;
