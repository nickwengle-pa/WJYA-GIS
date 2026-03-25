import Overlay from 'ol/Overlay';
import { useEffect, useRef } from 'react';
import type Map from 'ol/Map';
import type { IdentifyPopupData } from '../types/parcel';

interface ParcelPopupProps {
  map: Map | null;
  popup: IdentifyPopupData | null;
  onClose: () => void;
}

const ParcelPopup = ({ map, popup, onClose }: ParcelPopupProps) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  useEffect(() => {
    if (!map || !popupRef.current) {
      return;
    }

    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: {
        animation: {
          duration: 200
        }
      }
    });

    map.addOverlay(overlay);
    overlayRef.current = overlay;

    return () => {
      map.removeOverlay(overlay);
      overlayRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }

    if (!popup) {
      overlayRef.current.setPosition(undefined);
      return;
    }

    overlayRef.current.setPosition(popup.coordinate);
  }, [popup]);

  return (
    <div className={`parcel-popup ${popup ? 'visible' : ''}`} ref={popupRef}>
      {popup ? (
        <>
          <div className="popup-header">
            <strong>{popup.title}</strong>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
          <dl>
            {popup.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </div>
  );
};

export default ParcelPopup;
