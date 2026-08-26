import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  id: "default",
  restaurantName: "Himalayan Cuisine",
  address: "115 6th St, Glenwood Springs, CO 81601",
  latitude: 39.5505,
  longitude: -107.3248,
  maxRadiusMiles: 10.0,
  minOrderAmount: 15.0,
  deliveryFee: 5.0,
  freeDeliveryOver: 50.0,
  isDeliveryEnabled: true,
  enforceRadius: true,
  outOfRangeMessage:
    "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant.",
};

async function getSettingsDB() {
  if ((prisma as any).deliverySetting) {
    let settings = await (prisma as any).deliverySetting.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      settings = await (prisma as any).deliverySetting.create({
        data: DEFAULT_SETTINGS,
      });
    }
    return settings;
  }

  // Raw SQL fallback
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "DeliverySetting" WHERE id = 'default' LIMIT 1`
    );
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        ...r,
        isDeliveryEnabled: Boolean(r.isDeliveryEnabled),
        enforceRadius: Boolean(r.enforceRadius),
      };
    }
    await prisma.$executeRawUnsafe(
      `INSERT OR REPLACE INTO "DeliverySetting" (id, restaurantName, address, latitude, longitude, maxRadiusMiles, minOrderAmount, deliveryFee, freeDeliveryOver, isDeliveryEnabled, enforceRadius, outOfRangeMessage, updatedAt) VALUES ('default', 'Himalayan Cuisine', '115 6th St, Glenwood Springs, CO 81601', 39.5505, -107.3248, 10.0, 15.0, 5.0, 50.0, 1, 1, 'Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant.', datetime('now'))`
    );
    return DEFAULT_SETTINGS;
  } catch (e) {
    console.warn("SQL fallback query error:", e);
    return DEFAULT_SETTINGS;
  }
}

export async function GET() {
  try {
    const settings = await getSettingsDB();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    return NextResponse.json(
      { success: true, settings: DEFAULT_SETTINGS, fallback: true },
      { status: 200 }
    );
  }
}

