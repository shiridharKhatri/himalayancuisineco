import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Aggregated real-time metrics from SQLite database
    const [
      totalOrders,
      totalReservations,
      totalMenuItems,
      totalGiftCards,
      totalApplications,
      totalCatering,
      totalCustomers,
      orders,
      menuItems,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.reservation.count(),
      prisma.menuItem.count(),
      prisma.giftCard.count(),
      prisma.jobApplication.count(),
      prisma.cateringRequest.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      }),
      prisma.menuItem.findMany({
        include: {
          category: true,
        },
      }),
    ]);

    // 2. Real Revenue Metrics
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const activeOrders = orders.filter((o) =>
      ["NEW", "CONFIRMED", "PREPARING", "READY"].includes(o.status)
    );

    // 3. Real Channel Split
    const pickupOrders = orders.filter((o) => o.type === "PICKUP");
    const deliveryOrders = orders.filter((o) => o.type === "DELIVERY");

    const pickupRevenue = pickupOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 4. Real Average Order Value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 5. Real Past 7 Days Revenue Trend (Actual Database Order Dates)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dayName = days[d.getDay()];
      const dayString = d.toDateString();

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === dayString;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        day: dayName,
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Math.round(dayRevenue * 100) / 100,
        orders: dayOrders.length,
      };
    });

    // 6. Real Day of Week Order Activity (Sun - Sat)
    const dayActivity = days.map((dayName, dayIndex) => {
      const matching = orders.filter((o) => new Date(o.createdAt).getDay() === dayIndex);
      return {
        day: dayName,
        count: matching.length,
      };
    });

    // 7. Real Repeat Customer Rate Calculation
    const customerOrderCounts = new Map<string, number>();
    for (const order of orders) {
      const emailKey = (order.customerEmail || order.customerPhone || order.customerName || "").trim().toLowerCase();
      if (emailKey) {
        customerOrderCounts.set(emailKey, (customerOrderCounts.get(emailKey) || 0) + 1);
      }
    }
    const totalUniqueCustomers = customerOrderCounts.size;
    let repeatCustomerCount = 0;
    customerOrderCounts.forEach((count) => {
      if (count > 1) repeatCustomerCount++;
    });
    const repeatCustomerRate =
      totalUniqueCustomers > 0 ? Math.round((repeatCustomerCount / totalUniqueCustomers) * 100) : 0;

    // 8. Real Best Selling Dishes Aggregation from actual order items
    const dishSalesMap = new Map<string, { count: number; revenue: number; item: any }>();

    for (const order of orders) {
      for (const orderItem of order.items) {
        if (orderItem.menuItem) {
          const id = orderItem.menuItem.id;
          const current = dishSalesMap.get(id) || {
            count: 0,
            revenue: 0,
            item: orderItem.menuItem,
          };
          current.count += orderItem.quantity;
          current.revenue += orderItem.price * orderItem.quantity;
          dishSalesMap.set(id, current);
        }
      }
    }

    let bestSelling: any[] = [];
    if (dishSalesMap.size > 0) {
      bestSelling = Array.from(dishSalesMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((d, index) => ({
          id: `#${(83001 + index).toString()}`,
          name: d.item.name,
          category: d.item.category?.name || "Main Course",
          sold: `${d.count} ordered`,
          revenue: `$${d.revenue.toFixed(2)}`,
          rawRevenue: d.revenue,
          rating: (d.item.isPopular ? "4.9" : "4.8"),
          image: d.item.image,
        }));
    } else if (menuItems.length > 0) {
      // If no orders placed yet, list real menu dishes with 0 orders
      bestSelling = menuItems.slice(0, 5).map((item, index) => ({
        id: `#${(83001 + index).toString()}`,
        name: item.name,
        category: item.category?.name || "Main Course",
        sold: "0 ordered",
        revenue: "$0.00",
        rawRevenue: 0,
        rating: item.isPopular ? "4.9" : "4.7",
        image: item.image,
      }));
    }

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        activeOrdersCount: activeOrders.length,
        totalReservations,
        totalCustomers: totalCustomers || totalUniqueCustomers,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalMenuItems,
        totalGiftCards,
        totalApplications,
        totalCatering,
        pickupOrdersCount: pickupOrders.length,
        deliveryOrdersCount: deliveryOrders.length,
        pickupRevenue: Math.round(pickupRevenue * 100) / 100,
        deliveryRevenue: Math.round(deliveryRevenue * 100) / 100,
        repeatCustomerRate,
      },
      charts: {
        last7Days,
        dayActivity,
      },
      recentOrders: orders.slice(0, 8),
      bestSelling,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
