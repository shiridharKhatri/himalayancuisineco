/**
 * Haversine formula to calculate the distance between two points on the Earth's surface (lat/lng).
 * Returns distance in miles by default.
 */
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return calculateDistanceInMiles(lat1, lon1, lat2, lon2) * 1.60934;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface DeliveryCheckResult {
  isWithinRange: boolean;
  distanceMiles: number;
  maxRadiusMiles: number;
  error?: string;
}

export function checkDeliveryRange(
  userLat?: number | null,
  userLng?: number | null,
  centerLat = 39.5505,
  centerLng = -107.3248,
  maxRadiusMiles = 10.0,
  enforceRadius = true,
  customMessage?: string
): DeliveryCheckResult {
  if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
    return {
      isWithinRange: true, // Cannot determine lat/lng (e.g. manual text address without coordinates)
      distanceMiles: 0,
      maxRadiusMiles,
    };
  }

  const distance = calculateDistanceInMiles(centerLat, centerLng, userLat, userLng);
  const isWithinRange = !enforceRadius || distance <= maxRadiusMiles;

  let error: string | undefined = undefined;
  if (!isWithinRange) {
    const rawMsg = customMessage || "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles.";
    error = rawMsg.replace("{radius}", maxRadiusMiles.toFixed(1)).replace("{distance}", distance.toFixed(1));
  }

  return {
    isWithinRange,
    distanceMiles: parseFloat(distance.toFixed(2)),
    maxRadiusMiles,
    error,
  };
}
