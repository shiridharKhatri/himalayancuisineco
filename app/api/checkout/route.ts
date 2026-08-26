import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistanceInMiles } from "@/lib/geo";

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

async function getDeliverySettingsDB() {
  if ((prisma as any).deliverySetting) {
    try {
      const s = await (prisma as any).deliverySetting.findUnique({
        where: { id: "default" },
      });
      if (s) return s;
    } catch {}
  }
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
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function POST(req: Request) {
  try {
    const { items, deliveryType, tip, couponCode, customerDetails, deliveryDetails } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Shopping cart is empty" }, { status: 400 });
    }

    // Fetch active delivery settings
    const settings = await getDeliverySettingsDB();


    if (deliveryType === "DELIVERY") {
      if (!settings.isDeliveryEnabled) {
        return NextResponse.json(
          { error: "Delivery service is currently paused. Please switch to Pickup." },
          { status: 400 }
        );
      }

      // Check delivery radius if coordinates provided
      if (deliveryDetails?.lat && deliveryDetails?.lng && settings.enforceRadius) {
        const distance = calculateDistanceInMiles(
          settings.latitude,
          settings.longitude,
          parseFloat(deliveryDetails.lat),
          parseFloat(deliveryDetails.lng)
        );

        if (distance > settings.maxRadiusMiles) {
          const errMsg = settings.outOfRangeMessage
            .replace("{radius}", settings.maxRadiusMiles.toFixed(1))
            .replace("{distance}", distance.toFixed(1));
          return NextResponse.json(
            { error: errMsg || `Address is ${distance.toFixed(1)} miles away (Max allowed: ${settings.maxRadiusMiles} miles).` },
            { status: 400 }
          );
        }
      }
    }

    // Recalculate pricing server-side using database integrity
    let calculatedSubtotal = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const dbItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItem.id },
        include: {
          modifierGroups: {
            include: {
              modifierGroup: {
                include: {
                  modifiers: true
                }
              }
            }
          }
        }
      });

      if (!dbItem || !dbItem.isAvailable) {
        return NextResponse.json({ error: `Dish '${item.menuItem.name}' is currently unavailable.` }, { status: 400 });
      }

      // Calculate base price
      let itemSinglePrice = dbItem.price;

      // Validate modifiers pricing against DB
      const modifierDetails = [];
      for (const mod of item.selectedModifiers) {
        // Find modifier in database
        const dbMod = await prisma.modifier.findUnique({
          where: { id: mod.id }
        });
        if (dbMod) {
          itemSinglePrice += dbMod.price;
          modifierDetails.push({
            modifierName: dbMod.name,
            price: dbMod.price
          });
        }
      }

      calculatedSubtotal += itemSinglePrice * item.quantity;
      orderItemsToCreate.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: itemSinglePrice,
        modifiers: {
          create: modifierDetails
        }
      });
    }

    // Check minimum order amount for delivery
    if (deliveryType === "DELIVERY" && calculatedSubtotal < settings.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount for delivery is $${settings.minOrderAmount.toFixed(2)}. Your current subtotal is $${calculatedSubtotal.toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    // Apply Coupon discount server-side validation
    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === "NEPAL20") {
      discount = calculatedSubtotal * 0.20; // 20% off
    }

    const taxableAmount = Math.max(0, calculatedSubtotal - discount);
    const calculatedTax = taxableAmount * 0.0825; // 8.25% tax rate
    let calculatedDeliveryFee = 0;
    if (deliveryType === "DELIVERY") {
      calculatedDeliveryFee =
        calculatedSubtotal >= settings.freeDeliveryOver ? 0.0 : settings.deliveryFee;
    }
    const calculatedTotal = taxableAmount + calculatedTax + calculatedDeliveryFee + tip;


    // Find user by email to associate with order and award points
    const user = await prisma.user.findUnique({
      where: { email: customerDetails.email },
    });

    const userId = user ? user.id : null;

    // Create Order in database
    const newOrder = await prisma.order.create({
      data: {
        status: "NEW",
        type: deliveryType,
        userId,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        deliveryStreet: deliveryType === "DELIVERY" ? deliveryDetails.street : null,
        deliveryCity: deliveryType === "DELIVERY" ? deliveryDetails.city : null,
        deliveryState: deliveryType === "DELIVERY" ? deliveryDetails.state : null,
        deliveryZip: deliveryType === "DELIVERY" ? deliveryDetails.zipCode : null,
        deliveryFee: calculatedDeliveryFee,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        tip: tip,
        discount: discount,
        total: calculatedTotal,
        paymentStatus: "PAID", // Assume payment clears successfully
        stripeIntentId: `mock_stripe_${Math.random().toString(36).substring(2, 9)}`,
        items: {
          create: orderItemsToCreate.map(o => ({
            menuItemId: o.menuItemId,
            quantity: o.quantity,
            price: o.price,
            // Modifiers creation relations
            modifiers: o.modifiers
          }))
        }
      }
    });

    // Credit points to customer's RewardAccount since payment is PAID
    let earnedPoints = 0;
    if (user) {
      earnedPoints = Math.round(taxableAmount * 10);
      
      let rewardAccount = await prisma.rewardAccount.findUnique({
        where: { userId: user.id },
      });

      if (!rewardAccount) {
        rewardAccount = await prisma.rewardAccount.create({
          data: {
            userId: user.id,
            points: 0,
          },
        });
      }

      await prisma.rewardAccount.update({
        where: { userId: user.id },
        data: {
          points: {
            increment: earnedPoints,
          },
        },
      });

      await prisma.rewardTransaction.create({
        data: {
          accountId: rewardAccount.id,
          points: earnedPoints,
          description: `Earned points on Order #${newOrder.id.slice(-8).toUpperCase()}`,
          orderId: newOrder.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      total: calculatedTotal,
      earnedPoints,
    });

  } catch (error) {
    console.error("Server checkout error:", error);
    return NextResponse.json({ error: "Server failed to process order checkout" }, { status: 500 });
  }
}
