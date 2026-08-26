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

async function upsertSettingsDB(data: any) {
  if ((prisma as any).deliverySetting) {
    return await (prisma as any).deliverySetting.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
  }

  // Raw SQL fallback
  await prisma.$executeRawUnsafe(
    `INSERT INTO "DeliverySetting" (id, restaurantName, address, latitude, longitude, maxRadiusMiles, minOrderAmount, deliveryFee, freeDeliveryOver, isDeliveryEnabled, enforceRadius, outOfRangeMessage, updatedAt)
     VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       restaurantName=excluded.restaurantName,
       address=excluded.address,
       latitude=excluded.latitude,
       longitude=excluded.longitude,
       maxRadiusMiles=excluded.maxRadiusMiles,
       minOrderAmount=excluded.minOrderAmount,
       deliveryFee=excluded.deliveryFee,
       freeDeliveryOver=excluded.freeDeliveryOver,
       isDeliveryEnabled=excluded.isDeliveryEnabled,
       enforceRadius=excluded.enforceRadius,
       outOfRangeMessage=excluded.outOfRangeMessage,
       updatedAt=datetime('now')`,
    data.restaurantName,
    data.address,
    data.latitude,
    data.longitude,
    data.maxRadiusMiles,
    data.minOrderAmount,
    data.deliveryFee,
    data.freeDeliveryOver,
    data.isDeliveryEnabled ? 1 : 0,
    data.enforceRadius ? 1 : 0,
    data.outOfRangeMessage
  );

  return { id: "default", ...data };
}

export async function GET() {
  try {
    const settings = await getSettingsDB();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Admin delivery settings GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load delivery settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
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
    } = body;

    const data = {
      restaurantName: restaurantName !== undefined ? restaurantName : "Himalayan Cuisine",
      address: address !== undefined ? address : "115 6th St, Glenwood Springs, CO 81601",
      latitude: latitude !== undefined ? parseFloat(latitude) : 39.5505,
      longitude: longitude !== undefined ? parseFloat(longitude) : -107.3248,
      maxRadiusMiles: maxRadiusMiles !== undefined ? Math.max(0.1, parseFloat(maxRadiusMiles)) : 10.0,
      minOrderAmount: minOrderAmount !== undefined ? Math.max(0, parseFloat(minOrderAmount)) : 15.0,
      deliveryFee: deliveryFee !== undefined ? Math.max(0, parseFloat(deliveryFee)) : 5.0,
      freeDeliveryOver: freeDeliveryOver !== undefined ? Math.max(0, parseFloat(freeDeliveryOver)) : 50.0,
      isDeliveryEnabled: isDeliveryEnabled !== undefined ? Boolean(isDeliveryEnabled) : true,
      enforceRadius: enforceRadius !== undefined ? Boolean(enforceRadius) : true,
      outOfRangeMessage:
        outOfRangeMessage ||
        "Sorry, your address is outside our delivery zone. We only deliver within {radius} miles of our restaurant.",
    };

    const updated = await upsertSettingsDB(data);

    return NextResponse.json({
      success: true,
      message: "Delivery settings updated successfully",
      settings: updated,
    });
  } catch (error: any) {
    console.error("Admin delivery settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update delivery settings" },
      { status: 500 }
    );
  }
}

