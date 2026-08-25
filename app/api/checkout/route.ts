import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { items, deliveryType, tip, couponCode, customerDetails, deliveryDetails } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Shopping cart is empty" }, { status: 400 });
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

    // Apply Coupon discount server-side validation
    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === "NEPAL20") {
      discount = calculatedSubtotal * 0.20; // 20% off
    }

    const taxableAmount = Math.max(0, calculatedSubtotal - discount);
    const calculatedTax = taxableAmount * 0.0825; // 8.25% tax rate
    const calculatedDeliveryFee = deliveryType === "DELIVERY" ? 5.0 : 0.0;
    const calculatedTotal = taxableAmount + calculatedTax + calculatedDeliveryFee + tip;

    // Create Order in database
    const newOrder = await prisma.order.create({
      data: {
        status: "NEW",
        type: deliveryType,
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

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      total: calculatedTotal,
    });

  } catch (error) {
    console.error("Server checkout error:", error);
    return NextResponse.json({ error: "Server failed to process order checkout" }, { status: 500 });
  }
}
