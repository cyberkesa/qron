import { useEffect, useRef } from "react";

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function Map({ center, zoom }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && window.ymaps) {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: zoom,
        });

        const placemark = new window.ymaps.Placemark([center.lat, center.lng], {
          balloonContent: "Наш офис",
        });

        map.geoObjects.add(placemark);
      });
    }
  }, [center, zoom]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
