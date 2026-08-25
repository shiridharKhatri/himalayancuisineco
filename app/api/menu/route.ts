import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { isAvailable: true },
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
        }
      }
    });

    // Map relations to fit the frontend types format
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      order: cat.order,
      items: cat.items.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: item.image,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        isPopular: item.isPopular,
        dietaryTags: item.dietaryTags ? item.dietaryTags.split(",") : [],
        allergens: item.allergens ? item.allergens.split(",") : [],
        spiceLevel: item.spiceLevel,
        modifierGroups: item.modifierGroups.map((mg) => ({
          id: mg.modifierGroup.id,
          name: mg.modifierGroup.name,
          minSelect: mg.modifierGroup.minSelect,
          maxSelect: mg.modifierGroup.maxSelect,
          modifiers: mg.modifierGroup.modifiers.map((m) => ({
            id: m.id,
            groupId: m.groupId,
            name: m.name,
            price: m.price,
            isAvailable: m.isAvailable,
          })),
        })),
      })),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu data" }, { status: 500 });
  }
}
