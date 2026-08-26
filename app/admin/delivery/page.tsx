"use client";

import * as React from "react";
import {
  MapPin,
  Save,
  RefreshCw,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Search,
  DollarSign,
  ShieldCheck,
  Compass,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/stores/uiStore";
import { calculateDistanceInMiles } from "@/lib/geo";

// Lazy load MapView to prevent SSR issues with Leaflet
const MapView = React.lazy(() => import("@/components/ordering/MapView"));

export default function AdminDeliveryPage() {
  const { addToast } = useUIStore();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = React.useState(false);

  // Delivery Setting Form State
  const [restaurantName, setRestaurantName] = React.useState("Himalayan Cuisine");
  const [address, setAddress] = React.useState("115 6th St, Glenwood Springs, CO 81601");
  const [latitude, setLatitude] = React.useState<number>(39.5505);
  const [longitude, setLongitude] = React.useState<number>(-107.3248);
  const [maxRadiusMiles, setMaxRadiusMiles] = React.useState<number>(10.0);
  const [minOrderAmount, setMinOrderAmount] = React.useState<number>(15.0);
  const [deliveryFee, setDeliveryFee] = React.useState<number>(5.0);
  const [freeDeliveryOver, setFreeDeliveryOver] = React.useState<number>(50.0);
  const [isDeliveryEnabled, setIsDeliveryEnabled] = React.useState<boolean>(true);
  const [enforceRadius, setEnforceRadius] = React.useState<boolean>(true);
  const [outOfRangeMessage, setOutOfRangeMessage] = React.useState<string>(
    "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant."
  );

  // Address search query state
  const [searchQuery, setSearchQuery] = React.useState("");

  // Test address simulation state
  const [testMarkerPosition, setTestMarkerPosition] = React.useState<[number, number] | null>(null);

  // Load active delivery settings
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/delivery-settings");
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setRestaurantName(s.restaurantName || "Himalayan Cuisine");
        setAddress(s.address || "115 6th St, Glenwood Springs, CO 81601");
        setLatitude(s.latitude ?? 39.5505);
        setLongitude(s.longitude ?? -107.3248);
        setMaxRadiusMiles(s.maxRadiusMiles ?? 10.0);
        setMinOrderAmount(s.minOrderAmount ?? 15.0);
        setDeliveryFee(s.deliveryFee ?? 5.0);
        setFreeDeliveryOver(s.freeDeliveryOver ?? 50.0);
        setIsDeliveryEnabled(s.isDeliveryEnabled ?? true);
        setEnforceRadius(s.enforceRadius ?? true);
        setOutOfRangeMessage(
          s.outOfRangeMessage ||
            "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant."
        );
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to load delivery settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSettings();
  }, []);

  // Save settings handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/delivery-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          address,
          latitude,
          longitude,
          maxRadiusMiles,
          minOrderAmount,
          deliveryFee,
          freeDeliveryOver,
          isDeliveryEnabled,
          enforceRadius,
          outOfRangeMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast("Delivery settings & radius updated successfully!", "success");
      } else {
        throw new Error(data.error || "Failed to update");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to save delivery settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Search address using Nominatim forward geocode
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        {
          headers: { "Accept-Language": "en" },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        setLatitude(newLat);
        setLongitude(newLng);
        setAddress(item.display_name);
        addToast(`Location set to "${item.display_name.split(",")[0]}"`, "success");
        setSearchQuery("");
      } else {
        addToast("Location not found. Try a more specific address or city.", "error");
      }
    } catch (err) {
      addToast("Failed to search location.", "error");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Drag Hub Marker on Map
  const handleHubDragEnd = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    // Reverse geocode to get human address
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (err) {
      console.warn("Reverse geocode failed on drag", err);
    }
  };

  // Click on map to test distance or move hub
  const handleMapClick = (lat: number, lng: number) => {
    setTestMarkerPosition([lat, lng]);
  };

  // Calculated distance for test pin
  const testPinDistance = testMarkerPosition
    ? calculateDistanceInMiles(latitude, longitude, testMarkerPosition[0], testMarkerPosition[1])
    : null;
  const isTestPinOutOfRange = testPinDistance !== null ? testPinDistance > maxRadiusMiles : false;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#B51C20]" />
        <p className="font-serif text-base font-semibold text-neutral-600">
          Loading delivery zone configurations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
              Delivery Supported Location & Radius
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#B51C20]/10 text-[#B51C20] border border-[#B51C20]/20">
              Live Geofence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Configure the restaurant&apos;s supported delivery hub, boundary radius, order constraints, and customer range errors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            className="border-neutral-300 text-neutral-700 bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="shadow-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* KPI METRIC HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Delivery Radius
            </span>
            <div className="h-8 w-8 rounded-xl bg-red-50 text-[#B51C20] flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#141414] mt-2">
            {maxRadiusMiles} <span className="text-sm font-sans font-normal text-neutral-500">miles</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {(maxRadiusMiles * 1.60934).toFixed(1)} km boundary
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Delivery Center Hub
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <p className="font-sans text-sm font-bold text-[#141414] mt-2 truncate" title={address}>
            {restaurantName}
          </p>
          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Delivery Fee
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#141414] mt-2">
            ${deliveryFee.toFixed(2)}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 inline-block">
            Free on orders &gt; ${freeDeliveryOver.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
              Range Enforcement
            </span>
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
              enforceRadius ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
            }`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#141414] mt-2">
            {enforceRadius ? "Strict" : "Permissive"}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 inline-block">
            {enforceRadius ? "Blocks out-of-range orders" : "Allows all addresses"}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE MAP & SIMULATION (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            {/* Map Header with Address Search */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#141414] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#B51C20]" />
                  Live Geofence & Boundary Preview
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Drag the gold pin to reposition restaurant hub, or click anywhere to test distance.
                </p>
              </div>

              {/* Quick Search Tool */}
              <form onSubmit={handleSearchAddress} className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city/address..."
                    className="h-8 pl-8 pr-2 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#B51C20] w-full sm:w-48"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  isLoading={isSearchingLocation}
                  className="h-8 px-2.5 text-xs bg-white"
                >
                  Locate
                </Button>
              </form>
            </div>

            {/* Leaflet Map Box */}
            <div className="relative w-full h-[440px] bg-neutral-100">
              <React.Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-xs">Loading Interactive Geofence Map...</span>
                  </div>
                }
              >
                <MapView
                  center={[latitude, longitude]}
                  hubPosition={[latitude, longitude]}
                  hubName={restaurantName}
                  radiusMiles={maxRadiusMiles}
                  markerPosition={testMarkerPosition}
                  isOutOfRange={isTestPinOutOfRange}
                  allowDragHub={true}
                  onHubDragEnd={handleHubDragEnd}
                  onMapClick={handleMapClick}
                  zoom={12}
                />
              </React.Suspense>

              {/* Map Legend Overlay */}
              <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs rounded-xl p-2.5 shadow-md border border-neutral-200 text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-neutral-700">
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block border border-amber-600" />
                  <span>Restaurant Hub</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-neutral-700">
                  <span className="h-3 w-3 rounded-full bg-[#B51C20]/30 border border-[#B51C20] inline-block" />
                  <span>Delivery Zone ({maxRadiusMiles} mi)</span>
                </div>
                {testMarkerPosition && (
                  <div className="flex items-center gap-2 font-medium text-neutral-700">
                    <span className="h-3 w-3 rounded-full bg-red-600 inline-block" />
                    <span>Test Point</span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Simulation Strip */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neutral-400 shrink-0" />
                {testMarkerPosition && testPinDistance !== null ? (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-neutral-800">
                      Test Point: {testPinDistance.toFixed(2)} miles away
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Coordinates: {testMarkerPosition[0].toFixed(4)}, {testMarkerPosition[1].toFixed(4)}
                    </p>
                  </div>
                ) : (
                  <p className="text-neutral-500">
                    Click anywhere on the map to drop a test customer pin and calculate delivery distance.
                  </p>
                )}
              </div>

              {testMarkerPosition && testPinDistance !== null && (
                <div className="flex items-center gap-2">
                  {isTestPinOutOfRange ? (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                      OUT OF RANGE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      WITHIN RANGE
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setTestMarkerPosition(null)}
                    className="text-neutral-400 hover:text-neutral-600 underline text-[11px] cursor-pointer"
                  >
                    Clear Pin
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION FORM (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Section 1: Radius & Boundary Control */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-red-50 text-[#B51C20] flex items-center justify-center">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#141414]">
                    Delivery Radius & Scope
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#B51C20]">
                  {maxRadiusMiles} mi / {(maxRadiusMiles * 1.60934).toFixed(1)} km
                </span>
              </div>

              {/* Radius Slider + Number Input */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-neutral-700">
                  Maximum Delivery Radius (Miles)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={maxRadiusMiles}
                    onChange={(e) => setMaxRadiusMiles(parseFloat(e.target.value))}
                    className="flex-1 accent-[#B51C20] cursor-pointer"
                  />
                  <div className="w-20">
                    <Input
                      type="number"
                      min="0.5"
                      max="100"
                      step="0.5"
                      value={maxRadiusMiles}
                      onChange={(e) => setMaxRadiusMiles(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    />
                  </div>
                </div>

                {/* Quick preset buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {[5, 10, 15, 20, 30].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMaxRadiusMiles(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                        maxRadiusMiles === preset
                          ? "bg-[#B51C20] text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {preset}mi
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict Radius Enforcement Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block">
                    Strict Radius Enforcement
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Block customers outside radius from completing delivery checkout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceRadius}
                  onChange={(e) => setEnforceRadius(e.target.checked)}
                  className="h-4 w-4 accent-[#B51C20] rounded cursor-pointer"
                />
              </div>

              {/* Delivery Service Enable Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block">
                    Accept Delivery Orders
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Enable or temporarily pause delivery service across the store.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isDeliveryEnabled}
                  onChange={(e) => setIsDeliveryEnabled(e.target.checked)}
                  className="h-4 w-4 accent-[#B51C20] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Section 2: Store Hub Coordinates & Address */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Navigation className="h-4 w-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#141414]">
                  Restaurant Hub Coordinates
                </h3>
              </div>

              <Input
                label="Restaurant Business Name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g. Himalayan Cuisine"
              />

              <Input
                label="Store Hub Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 115 6th St, Glenwood Springs, CO 81601"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Section 3: Pricing & Minimums */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#141414]">
                  Order Pricing & Fees
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Delivery Fee ($)"
                  type="number"
                  step="0.5"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Min Order ($)"
                  type="number"
                  step="1"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Free Over ($)"
                  type="number"
                  step="5"
                  value={freeDeliveryOver}
                  onChange={(e) => setFreeDeliveryOver(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Section 4: Customer Error Message */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-neutral-400" />
                  Out-of-Range Customer Alert
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Supports {"{radius}"} & {"{distance}"}
                </span>
              </div>
              <textarea
                value={outOfRangeMessage}
                onChange={(e) => setOutOfRangeMessage(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#B51C20] focus:border-[#B51C20]"
                placeholder="Message shown when customer selects an address beyond delivery range..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="w-full h-11 text-sm font-semibold shadow-md"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Delivery Settings
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
