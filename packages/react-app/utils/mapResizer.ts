import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapResizer() {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, [map]);
    return null;
  }