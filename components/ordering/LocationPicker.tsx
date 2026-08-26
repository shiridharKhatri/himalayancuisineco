"use client";

import * as React from "react";
import { MapPin, PenLine, Navigation, Loader2, Check, AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { DeliveryAddress } from "@/stores/cartStore";
import { calculateDistanceInMiles, checkDeliveryRange } from "@/lib/geo";

// Lazy-load map components to avoid SSR issues with Leaflet
const MapView = React.lazy(() => import("./MapView"));

interface LocationPickerProps {
  initialAddress?: DeliveryAddress | null;
  onConfirm: (address: DeliveryAddress) => void;
  onCancel?: () => void;
  onSwitchToPickup?: () => void;
}

type TabMode = "map" | "manual";

interface DeliverySettings {
  restaurantName: string;
  address: string;
  latitude: number;
  longitude: number;
  maxRadiusMiles: number;
  minOrderAmount: number;
  deliveryFee: number;
  isDeliveryEnabled: boolean;
  enforceRadius: boolean;
  outOfRangeMessage: string;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  restaurantName: "Himalayan Cuisine",
  address: "115 6th St, Glenwood Springs, CO 81601",
  latitude: 39.5505,
  longitude: -107.3248,
  maxRadiusMiles: 10.0,
  minOrderAmount: 15.0,
  deliveryFee: 5.0,
  isDeliveryEnabled: true,
  enforceRadius: true,
  outOfRangeMessage:
    "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant.",
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialAddress,
  onConfirm,
  onCancel,
  onSwitchToPickup,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabMode>("map");

  // Dynamic delivery settings from server
  const [deliverySettings, setDeliverySettings] = React.useState<DeliverySettings>(DEFAULT_SETTINGS);

  // Fetch delivery settings on mount
  React.useEffect(() => {
    fetch("/api/delivery-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setDeliverySettings({
            restaurantName: data.settings.restaurantName || "Himalayan Cuisine",
            address: data.settings.address || "115 6th St, Glenwood Springs, CO 81601",
            latitude: data.settings.latitude ?? 39.5505,
            longitude: data.settings.longitude ?? -107.3248,
            maxRadiusMiles: data.settings.maxRadiusMiles ?? 10.0,
            minOrderAmount: data.settings.minOrderAmount ?? 15.0,
            deliveryFee: data.settings.deliveryFee ?? 5.0,
            isDeliveryEnabled: data.settings.isDeliveryEnabled ?? true,
            enforceRadius: data.settings.enforceRadius ?? true,
            outOfRangeMessage:
              data.settings.outOfRangeMessage ||
              "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant.",
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch delivery settings, using default", err));
  }, []);

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

  // Validation & Range Check
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Real-time distance calculation
  const distanceMiles = React.useMemo(() => {
    if (!markerPosition) return null;
    return calculateDistanceInMiles(
      deliverySettings.latitude,
      deliverySettings.longitude,
      markerPosition[0],
      markerPosition[1]
    );
  }, [markerPosition, deliverySettings]);

  const isOutOfRange = React.useMemo(() => {
    if (distanceMiles === null) return false;
    return distanceMiles > deliverySettings.maxRadiusMiles;
  }, [distanceMiles, deliverySettings.maxRadiusMiles]);

  const outOfRangeFormattedError = React.useMemo(() => {
    if (!isOutOfRange || distanceMiles === null) return null;
    return deliverySettings.outOfRangeMessage
      .replace("{radius}", deliverySettings.maxRadiusMiles.toFixed(1))
      .replace("{distance}", distanceMiles.toFixed(1));
  }, [isOutOfRange, distanceMiles, deliverySettings]);

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

  // Forward geocode manual address
  const forwardGeocodeManual = async (
    searchAddress: string
  ): Promise<[number, number] | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress
        )}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      }
    } catch (e) {
      console.warn("Forward geocode error:", e);
    }
    return null;
  };

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
  const handleConfirm = async () => {
    const errs: Record<string, string> = {};
    if (!street.trim()) errs.street = "Street address is required";
    if (!city.trim()) errs.city = "City is required";
    if (!zipCode.trim() || zipCode.length < 5) errs.zipCode = "Valid ZIP code is required";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    let finalLat = markerPosition?.[0];
    let finalLng = markerPosition?.[1];

    // If manual address without marker coords, geocode it
    if (!finalLat || !finalLng) {
      const coords = await forwardGeocodeManual(`${street}, ${city}, ${state} ${zipCode}`);
      if (coords) {
        finalLat = coords[0];
        finalLng = coords[1];
        setMarkerPosition(coords);
      }
    }

    // Check delivery range
    if (finalLat && finalLng && deliverySettings.enforceRadius) {
      const dist = calculateDistanceInMiles(
        deliverySettings.latitude,
        deliverySettings.longitude,
        finalLat,
        finalLng
      );
      if (dist > deliverySettings.maxRadiusMiles) {
        setErrors({
          range: `Out of delivery range (${dist.toFixed(1)} mi away). We only deliver within ${deliverySettings.maxRadiusMiles} miles.`,
        });
        return;
      }
    }

    onConfirm({
      street: street.trim(),
      city: city.trim(),
      state,
      zipCode: zipCode.trim(),
      lat: finalLat,
      lng: finalLng,
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
                center={
                  markerPosition || [deliverySettings.latitude, deliverySettings.longitude]
                }
                markerPosition={markerPosition}
                hubPosition={[deliverySettings.latitude, deliverySettings.longitude]}
                hubName={deliverySettings.restaurantName}
                radiusMiles={deliverySettings.maxRadiusMiles}
                isOutOfRange={isOutOfRange}
                onMapClick={handleMapClick}
                onMarkerDragEnd={handleMarkerDragEnd}
              />
            </React.Suspense>

            {/* Click hint overlay (only when no marker placed) */}
            {!markerPosition && !isGeocoding && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-charcoal/80 text-cream-light px-4 py-2 rounded-full font-sans text-xs font-medium shadow-lg pointer-events-none">
                Click on the map within the circle to drop a pin
              </div>
            )}

            {/* Delivery boundary badge */}
            <div className="absolute top-3 right-3 bg-cream-light/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-neutral-warm/50 text-[10px] font-sans font-semibold text-charcoal shadow-xs pointer-events-none">
              Max Radius: {deliverySettings.maxRadiusMiles} mi
            </div>
          </div>

          {/* OUT OF RANGE ERROR BANNER */}
          {isOutOfRange && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 space-y-2 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-[#B51C20] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-sans text-xs font-bold text-[#B51C20]">
                    Out of Delivery Range ({distanceMiles?.toFixed(1)} miles away)
                  </p>
                  <p className="font-sans text-xs text-red-700 leading-relaxed">
                    {outOfRangeFormattedError}
                  </p>
                </div>
              </div>

              {onSwitchToPickup && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSwitchToPickup}
                    className="px-3 py-1.5 rounded-xl bg-[#B51C20] hover:bg-[#9B181B] text-white font-sans text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Switch to Pickup
                  </button>
                  <span className="text-[11px] text-neutral-500 font-sans">
                    (No delivery fee • Ready in 20-30 mins)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Geocode error */}
          {geocodeError && (
            <p className="font-sans text-xs text-brand-red font-medium bg-brand-red-soft/30 px-3 py-2 rounded-full">
              {geocodeError}
            </p>
          )}

          {/* Resolved address preview (when geocoded) */}
          {street && !isGeocoding && (
            <div className="bg-cream-light border border-neutral-warm/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className={`h-4 w-4 mt-0.5 shrink-0 ${isOutOfRange ? "text-red-500" : "text-brand-red"}`} />
                  <div className="font-sans text-sm text-charcoal">
                    <p className="font-semibold">{street}</p>
                    <p className="text-muted-gray text-xs mt-0.5">
                      {city}{city && state ? ", " : ""}{state} {zipCode}
                    </p>
                  </div>
                </div>

                {/* Distance Badge */}
                {distanceMiles !== null && (
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold font-sans flex items-center gap-1 ${
                      isOutOfRange
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isOutOfRange ? (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        {distanceMiles.toFixed(1)} mi (Out)
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {distanceMiles.toFixed(1)} mi (In Zone)
                      </>
                    )}
                  </span>
                )}
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

      {/* General range error */}
      {errors.range && (
        <div className="bg-red-50 border border-red-200 text-[#B51C20] rounded-xl p-3 text-xs font-sans font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errors.range}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          className={`flex-1 ${
            isOutOfRange && deliverySettings.enforceRadius
              ? "bg-neutral-400 hover:bg-neutral-500 cursor-not-allowed"
              : ""
          }`}
          onClick={handleConfirm}
          disabled={isOutOfRange && deliverySettings.enforceRadius}
        >
          <Check className="h-4 w-4 mr-2" />
          {isOutOfRange && deliverySettings.enforceRadius
            ? "Out of Delivery Range"
            : "Confirm Address"}
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

