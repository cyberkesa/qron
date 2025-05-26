import { useEffect, useRef } from 'react';

interface MapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  zoom: number;
  className?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function Map({
  coordinates,
  zoom,
  className = 'w-full h-[400px] rounded-lg overflow-hidden shadow-lg',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && window.ymaps) {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [coordinates.lat, coordinates.lng],
          zoom: zoom,
        });

        const placemark = new window.ymaps.Placemark(
          [coordinates.lat, coordinates.lng],
          {
            balloonContent: 'Наш офис',
          }
        );

        map.geoObjects.add(placemark);
      });
    }
  }, [coordinates, zoom]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
