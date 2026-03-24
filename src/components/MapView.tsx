import type { RefObject } from 'react';

interface MapViewProps {
  mapContainerRef: RefObject<HTMLDivElement | null>;
}

const MapView = ({ mapContainerRef }: MapViewProps) => <div className="map-container" ref={mapContainerRef} />;

export default MapView;
