"use client";

import * as React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue in bundled apps
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom red marker for the delivery pin
const deliveryIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapViewProps {
  center: [number, number];
  markerPosition: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDragEnd: (lat: number, lng: number) => void;
}

// Sub-component to handle map click events
const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Sub-component to recenter map when marker changes
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ center, markerPosition, onMapClick, onMarkerDragEnd }) => {
  const handleDragEnd = React.useCallback(
    (e: L.DragEndEvent) => {
      const marker = e.target;
      const position = marker.getLatLng();
      onMarkerDragEnd(position.lat, position.lng);
    },
    [onMarkerDragEnd]
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapClickHandler onClick={onMapClick} />
      {markerPosition && (
        <>
          <RecenterMap center={markerPosition} />
          <Marker
            position={markerPosition}
            icon={deliveryIcon}
            draggable={true}
            eventHandlers={{ dragend: handleDragEnd }}
          />
        </>
      )}
    </MapContainer>
  );
};

export default MapView;
