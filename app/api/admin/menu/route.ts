import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all menu items and categories
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const query = searchParams.get("q") || "";

    const where: any = {};

    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }

    if (query.trim()) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const [items, categories] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        include: {
          category: true,
        },
      }),
      prisma.menuCategory.findMany({
        orderBy: { order: "asc" },
      }),
    ]);

    return NextResponse.json({ items, categories });
  } catch (error: any) {
    console.error("Admin Menu GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch menu items" }, { status: 500 });
  }
}

// POST: Create a new dish
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      description,
      price,
      image,
      dietaryTags,
      allergens,
      spiceLevel,
      isAvailable,
      isFeatured,
      isPopular,
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        categoryId,
        description: (description || "").trim(),
        price: parseFloat(price),
        image: image || "/images/dish_momo_jhol.jpg",
        dietaryTags: Array.isArray(dietaryTags) ? dietaryTags.join(",") : (dietaryTags || ""),
        allergens: Array.isArray(allergens) ? allergens.join(",") : (allergens || ""),
        spiceLevel: parseInt(spiceLevel || "0", 10),
        isAvailable: isAvailable ?? true,
        isFeatured: Boolean(isFeatured),
        isPopular: Boolean(isPopular),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("Admin Menu POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create menu item" }, { status: 500 });
  }
}

// PUT: Update an existing dish or toggle availability
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const dataToUpdate: any = {};

    if (updateData.name !== undefined) dataToUpdate.name = updateData.name.trim();
    if (updateData.categoryId !== undefined) dataToUpdate.categoryId = updateData.categoryId;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description.trim();
    if (updateData.price !== undefined) dataToUpdate.price = parseFloat(updateData.price);
    if (updateData.image !== undefined) dataToUpdate.image = updateData.image;
    if (updateData.dietaryTags !== undefined) {
      dataToUpdate.dietaryTags = Array.isArray(updateData.dietaryTags)
        ? updateData.dietaryTags.join(",")
        : updateData.dietaryTags;
    }
    if (updateData.allergens !== undefined) {
      dataToUpdate.allergens = Array.isArray(updateData.allergens)
        ? updateData.allergens.join(",")
        : updateData.allergens;
    }
    if (updateData.spiceLevel !== undefined) dataToUpdate.spiceLevel = parseInt(updateData.spiceLevel, 10);
    if (updateData.isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(updateData.isAvailable);
    if (updateData.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.isPopular !== undefined) dataToUpdate.isPopular = Boolean(updateData.isPopular);

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error("Admin Menu PUT Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update menu item" }, { status: 500 });
  }
}

// DELETE: Delete a menu item
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error: any) {
    console.error("Admin Menu DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete menu item" }, { status: 500 });
  }
}
