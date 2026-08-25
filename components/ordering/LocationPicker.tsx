"use client";

import * as React from "react";
import { MapPin, PenLine, Navigation, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { DeliveryAddress } from "@/stores/cartStore";

// Lazy-load map components to avoid SSR issues with Leaflet
const MapView = React.lazy(() => import("./MapView"));

interface LocationPickerProps {
  initialAddress?: DeliveryAddress | null;
  onConfirm: (address: DeliveryAddress) => void;
  onCancel?: () => void;
}

type TabMode = "map" | "manual";

// Restaurant center coordinates (Glenwood Springs, CO)
const RESTAURANT_CENTER: [number, number] = [39.5505, -107.3248];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialAddress,
  onConfirm,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabMode>("map");

  // Map state
  const [markerPosition, setMarkerPosition] = React.useState<[number, number] | null>(
    initialAddress?.lat && initialAddress?.lng
      ? [initialAddress.lat, initialAddress.lng]
      : null
  );
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [geocodeError, setGeocodeError] = React.useState<string | null>(null);

  // Address fields (shared between map and manual)
  const [street, setStreet] = React.useState(initialAddress?.street || "");
  const [city, setCity] = React.useState(initialAddress?.city || "");
  const [state, setState] = React.useState(initialAddress?.state || "CO");
  const [zipCode, setZipCode] = React.useState(initialAddress?.zipCode || "");

  // Validation
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reverse geocode lat/lng → address using free Nominatim
  const reverseGeocode = React.useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setGeocodeError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: { "Accept-Language": "en" },
        }
      );
      if (!res.ok) throw new Error("Geocoding failed");
      const data = await res.json();
      const addr = data.address || {};

      const houseNumber = addr.house_number || "";
      const road = addr.road || addr.pedestrian || addr.footway || "";
      const resolvedStreet = houseNumber ? `${houseNumber} ${road}` : road;

      setStreet(resolvedStreet || data.display_name?.split(",")[0] || "");
      setCity(addr.city || addr.town || addr.village || addr.hamlet || addr.county || "");
      setState(addr.state || "CO");
      setZipCode(addr.postcode || "");
      setErrors({});
    } catch {
      setGeocodeError("Could not resolve address. You can enter it manually.");
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Handle map click
  const handleMapClick = React.useCallback(
    (lat: number, lng: number) => {
      setMarkerPosition([lat, lng]);
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Handle marker drag end
  const handleMarkerDragEnd = React.useCallback(
    (lat: number, lng: number) => {
      setMarkerPosition([lat, lng]);
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Use browser geolocation
  const handleUseMyLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      setGeocodeError("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      () => {
        setIsGeocoding(false);
        setGeocodeError("Unable to retrieve your location. Please allow location access or pick on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [reverseGeocode]);

  // Validate and confirm
  const handleConfirm = () => {
    const errs: Record<string, string> = {};
    if (!street.trim()) errs.street = "Street address is required";
    if (!city.trim()) errs.city = "City is required";
    if (!zipCode.trim() || zipCode.length < 5) errs.zipCode = "Valid ZIP code is required";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onConfirm({
      street: street.trim(),
      city: city.trim(),
      state,
      zipCode: zipCode.trim(),
      lat: markerPosition?.[0],
      lng: markerPosition?.[1],
    });
  };

  const US_STATES = [
    { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
  ];

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1 bg-cream-dark rounded-full border border-neutral-warm/40">
        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 rounded-full cursor-pointer ${
            activeTab === "map"
              ? "bg-cream-light text-brand-red shadow-sm"
              : "text-muted-gray hover:text-charcoal"
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Use Map
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 rounded-full cursor-pointer ${
            activeTab === "manual"
              ? "bg-cream-light text-brand-red shadow-sm"
              : "text-muted-gray hover:text-charcoal"
          }`}
        >
          <PenLine className="h-3.5 w-3.5" />
          Enter Manually
        </button>
      </div>

      {/* MAP TAB */}
      {activeTab === "map" && (
        <div className="space-y-4">
          {/* Use My Location Button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isGeocoding}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-warm rounded-full bg-cream-light font-sans text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-cream-dark/50 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isGeocoding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isGeocoding ? "Detecting location..." : "Use My Current Location"}
          </button>

          {/* Map Container */}
          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-neutral-warm/60 bg-cream-dark">
            <React.Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-cream-dark">
                  <div className="flex flex-col items-center gap-2 text-muted-gray">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-sans text-xs">Loading map...</span>
                  </div>
                </div>
              }
            >
              <MapView
                center={markerPosition || RESTAURANT_CENTER}
                markerPosition={markerPosition}
                onMapClick={handleMapClick}
                onMarkerDragEnd={handleMarkerDragEnd}
              />
            </React.Suspense>

            {/* Click hint overlay (only when no marker placed) */}
            {!markerPosition && !isGeocoding && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-charcoal/80 text-cream-light px-4 py-2 rounded-full font-sans text-xs font-medium shadow-lg pointer-events-none">
                Click on the map to drop a pin
              </div>
            )}
          </div>

          {/* Geocode error */}
          {geocodeError && (
            <p className="font-sans text-xs text-brand-red font-medium bg-brand-red-soft/30 px-3 py-2 rounded-full">
              {geocodeError}
            </p>
          )}

          {/* Resolved address preview (when geocoded) */}
          {street && !isGeocoding && (
            <div className="bg-cream-light border border-neutral-warm/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-red mt-0.5 shrink-0" />
                <div className="font-sans text-sm text-charcoal">
                  <p className="font-semibold">{street}</p>
                  <p className="text-muted-gray text-xs mt-0.5">
                    {city}{city && state ? ", " : ""}{state} {zipCode}
                  </p>
                </div>
              </div>
              {/* Allow editing resolved address */}
              <div className="space-y-3 pt-2 border-t border-neutral-warm/30">
                <p className="font-sans text-[10px] uppercase tracking-wider text-muted-gray font-semibold">
                  Adjust if needed
                </p>
                <Input
                  label="Street Address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  error={errors.street}
                  placeholder="e.g. 123 Main St"
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    placeholder="City"
                  />
                  <Select
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    options={US_STATES}
                  />
                  <Input
                    label="ZIP"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    error={errors.zipCode}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL TAB */}
      {activeTab === "manual" && (
        <div className="space-y-4">
          <Input
            label="Street Address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            error={errors.street}
            placeholder="e.g. 123 Main St, Apt 4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              placeholder="Glenwood Springs"
            />
            <Select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={US_STATES}
            />
            <Input
              label="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              error={errors.zipCode}
              placeholder="81601"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="button" variant="primary" className="flex-1" onClick={handleConfirm}>
          <Check className="h-4 w-4 mr-2" />
          Confirm Address
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
