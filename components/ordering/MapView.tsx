"use client";

import * as React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents, useMap } from "react-leaflet";
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

// Custom red marker for the customer delivery pin
const deliveryIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom gold/black marker for the restaurant hub
const restaurantHubIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export interface MapViewProps {
  center: [number, number];
  markerPosition?: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  hubPosition?: [number, number] | null;
  hubName?: string;
  radiusMiles?: number;
  isOutOfRange?: boolean;
  allowDragHub?: boolean;
  onHubDragEnd?: (lat: number, lng: number) => void;
  zoom?: number;
}

// Sub-component to handle map click events
const MapClickHandler: React.FC<{ onClick?: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Sub-component to recenter map when center changes
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({
  center,
  markerPosition,
  onMapClick,
  onMarkerDragEnd,
  hubPosition,
  hubName = "Himalayan Cuisine Hub",
  radiusMiles,
  isOutOfRange = false,
  allowDragHub = false,
  onHubDragEnd,
  zoom = 13,
}) => {
  const handleCustomerMarkerDragEnd = React.useCallback(
    (e: L.DragEndEvent) => {
      if (!onMarkerDragEnd) return;
      const marker = e.target;
      const position = marker.getLatLng();
      onMarkerDragEnd(position.lat, position.lng);
    },
    [onMarkerDragEnd]
  );

  const handleHubMarkerDragEnd = React.useCallback(
    (e: L.DragEndEvent) => {
      if (!onHubDragEnd) return;
      const marker = e.target;
      const position = marker.getLatLng();
      onHubDragEnd(position.lat, position.lng);
    },
    [onHubDragEnd]
  );

  const radiusInMeters = radiusMiles ? radiusMiles * 1609.344 : null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {onMapClick && <MapClickHandler onClick={onMapClick} />}

      {/* Recenter */}
      {markerPosition && <RecenterMap center={markerPosition} />}
      {!markerPosition && hubPosition && <RecenterMap center={hubPosition} />}

      {/* Delivery Zone Radius Circle */}
      {hubPosition && radiusInMeters && (
        <Circle
          center={hubPosition}
          radius={radiusInMeters}
          pathOptions={{
            color: isOutOfRange ? "#E53E3E" : "#B51C20",
            fillColor: isOutOfRange ? "#FED7D7" : "#B51C20",
            fillOpacity: 0.12,
            weight: 2,
            dashArray: isOutOfRange ? "6, 6" : undefined,
          }}
        />
      )}

      {/* Restaurant Hub Marker */}
      {hubPosition && (
        <Marker
          position={hubPosition}
          icon={restaurantHubIcon}
          draggable={allowDragHub}
          eventHandlers={allowDragHub ? { dragend: handleHubMarkerDragEnd } : undefined}
        >
          <Popup>
            <div className="text-xs font-sans p-1">
              <strong className="text-charcoal block">{hubName}</strong>
              <span className="text-muted-gray text-[11px] block mt-0.5">
                Delivery Center • {radiusMiles ? `${radiusMiles} mi radius` : ""}
              </span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Customer Delivery Pin Marker */}
      {markerPosition && (
        <Marker
          position={markerPosition}
          icon={deliveryIcon}
          draggable={!!onMarkerDragEnd}
          eventHandlers={{ dragend: handleCustomerMarkerDragEnd }}
        >
          <Popup>
            <div className="text-xs font-sans p-1">
              <strong className="text-charcoal block">Selected Delivery Point</strong>
              {isOutOfRange ? (
                <span className="text-brand-red font-semibold text-[11px] block mt-0.5">
                  ⚠️ Outside Delivery Range
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">
                  ✓ Within Delivery Zone
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapView;

