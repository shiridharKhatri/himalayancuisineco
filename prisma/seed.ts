import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

process.env.DATABASE_URL = "file:./prisma/dev.db";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.rewardTransaction.deleteMany();
  await prisma.rewardAccount.deleteMany();
  await prisma.giftCardTransaction.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.cateringRequest.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.orderItemModifier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemModifierGroup.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create admin & customer users
  const admin = await prisma.user.create({
    data: {
      name: "Tashi Sherpa",
      email: "admin@himalayan.com",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Mingma Lama",
      email: "customer@himalayan.com",
      role: "CUSTOMER",
    },
  });

  // Create address
  await prisma.address.create({
    data: {
      userId: customer.id,
      street: "123 Main St, Apt 4",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      isDefault: true,
    },
  });

  // Create categories
  const categoryMap: Record<string, string> = {};
  const categoriesData = [
  {
    "id": "cat-popular",
    "name": "Popular",
    "slug": "popular",
    "order": 1
  },
  {
    "id": "cat-starters",
    "name": "Starters",
    "slug": "starters",
    "order": 2
  },
  {
    "id": "cat-soups-salads",
    "name": "Soups & Salads",
    "slug": "soups-salads",
    "order": 3
  },
  {
    "id": "cat-main-course-veg",
    "name": "Main Course Veg",
    "slug": "main-course-veg",
    "order": 4
  },
  {
    "id": "cat-sides-desserts",
    "name": "Sides & Desserts",
    "slug": "sides-desserts",
    "order": 5
  }
];
  for (const cat of categoriesData) {
    const createdCat = await prisma.menuCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
      },
    });
    categoryMap[cat.id] = createdCat.id;
  }

  // Create menu items
  const itemsData = [
  {
    "id": "item-chicken-butter-masala",
    "categoryId": "cat-popular",
    "name": "Chicken Butter Masala",
    "slug": "item-chicken-butter-masala",
    "description": "Traditional Himalayan specialty seasoned with aromatic mountain herbs.",
    "price": 21,
    "image": "/images/item-chicken-butter-masala.jpg",
    "isAvailable": true,
    "isFeatured": true,
    "isPopular": false,
    "dietaryTags": [
      "gluten-free",
      "dairy-free"
    ],
    "allergens": [],
    "spiceLevel": 2,
    "modifierGroups": []
  },
  {
    "id": "item-nepalese-tandoori-chicken",
    "categoryId": "cat-popular",
    "name": "Nepalese Tandoori Chicken",
    "slug": "item-nepalese-tandoori-chicken",
    "description": "Traditional Himalayan specialty seasoned with aromatic mountain herbs.",
    "price": 23.99,
    "image": "/images/item-nepalese-tandoori-chicken.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-vegetable-haandi-biryani",
    "categoryId": "cat-popular",
    "name": "Vegetable Haandi Biryani",
    "slug": "item-vegetable-haandi-biryani",
    "description": "Traditional Himalayan specialty seasoned with aromatic mountain herbs.",
    "price": 21,
    "image": "/images/item-vegetable-haandi-biryani.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-chicken-curry",
    "categoryId": "cat-popular",
    "name": "Chicken Curry",
    "slug": "item-chicken-curry",
    "description": "Traditional Himalayan specialty seasoned with aromatic mountain herbs.",
    "price": 21,
    "image": "/images/item-chicken-curry.jpg",
    "isAvailable": true,
    "isFeatured": true,
    "isPopular": false,
    "dietaryTags": [
      "gluten-free",
      "dairy-free"
    ],
    "allergens": [],
    "spiceLevel": 2,
    "modifierGroups": []
  },
  {
    "id": "item-chicken-haandi-biryani",
    "categoryId": "cat-popular",
    "name": "Chicken Haandi Biryani",
    "slug": "item-chicken-haandi-biryani",
    "description": "Traditional Himalayan specialty seasoned with aromatic mountain herbs.",
    "price": 23,
    "image": "/images/item-chicken-haandi-biryani.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-avocado-quinoa-salad",
    "categoryId": "cat-popular",
    "name": "Avocado Quinoa Salad",
    "slug": "item-avocado-quinoa-salad",
    "description": "Traditional Himalayan specialty seasoned with aromatic mountain herbs.",
    "price": 19,
    "image": "/images/item-avocado-quinoa-salad.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-samosa",
    "categoryId": "cat-starters",
    "name": "Samosa",
    "slug": "item-samosa",
    "description": "Vegan. Potato, onion, G/G paste, cilantro, green peas, spices mint chutney, ketchup, and pakora sauce",
    "price": 11.95,
    "image": "/images/item-samosa.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-jeera-aalu",
    "categoryId": "cat-starters",
    "name": "Jeera Aalu",
    "slug": "item-jeera-aalu",
    "description": "Potatoes, cumin seeds cilantro, spices",
    "price": 14.5,
    "image": "/images/item-jeera-aalu.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-vegetable-pakora",
    "categoryId": "cat-starters",
    "name": "Vegetable Pakora",
    "slug": "item-vegetable-pakora",
    "description": "Vegan. Mixed vegetables, chickpea flour, spices, mint chutney, tamarind sauce",
    "price": 12.5,
    "image": "/images/item-vegetable-pakora.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-chicken-pakora",
    "categoryId": "cat-starters",
    "name": "Chicken Pakora",
    "slug": "item-chicken-pakora",
    "description": "Chicken, chickpea flour, eggs, spices, mint chutney, tamarind sauce",
    "price": 15.5,
    "image": "/images/item-chicken-pakora.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-himalayan-soup",
    "categoryId": "cat-soups-salads",
    "name": "Himalayan Soup",
    "slug": "item-himalayan-soup",
    "description": "Mixed vegetables, cilantro, scallion, chicken, lemon juice, soy sauce, homemade flat noodle",
    "price": 15,
    "image": "/images/item-himalayan-soup.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": true,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 1,
    "modifierGroups": []
  },
  {
    "id": "item-lettuce-wrap-potato-salad",
    "categoryId": "cat-soups-salads",
    "name": "Lettuce Wrap Potato Salad",
    "slug": "item-lettuce-wrap-potato-salad",
    "description": "Gluten free, vegan. Potato, green peas, green chili, lemon juice, sesame seed, vegetable oil, turmeric vinaigrette",
    "price": 13,
    "image": "/images/item-lettuce-wrap-potato-salad.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": true,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 1,
    "modifierGroups": []
  },
  {
    "id": "item-goat-cheese-beet-salad",
    "categoryId": "cat-soups-salads",
    "name": "Goat Cheese & Beet Salad",
    "slug": "item-goat-cheese-beet-salad",
    "description": "Gluten free, vegan. Cucumber, carrot, tomato, mix lettuce, capsicum, lemon",
    "price": 15,
    "image": "/images/item-goat-cheese-beet-salad.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": true,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 1,
    "modifierGroups": []
  },
  {
    "id": "item-daal-makhani",
    "categoryId": "cat-main-course-veg",
    "name": "Daal Makhani",
    "slug": "item-daal-makhani",
    "description": "Vegan. Cream, lentils, tomato, spices. Served with mango pickle, raita, mint chutney, papadam",
    "price": 19,
    "image": "/images/item-daal-makhani.jpg",
    "isAvailable": true,
    "isFeatured": true,
    "isPopular": false,
    "dietaryTags": [
      "gluten-free",
      "dairy-free"
    ],
    "allergens": [],
    "spiceLevel": 2,
    "modifierGroups": []
  },
  {
    "id": "item-mixed-vegetable-curry",
    "categoryId": "cat-main-course-veg",
    "name": "Mixed Vegetable Curry",
    "slug": "item-mixed-vegetable-curry",
    "description": "Vegan. Mixed veggies, onion, G/G paste, cilantro, scallion, and spices. Served with mango pickle, raita and papadam",
    "price": 19,
    "image": "/images/item-mixed-vegetable-curry.jpg",
    "isAvailable": true,
    "isFeatured": true,
    "isPopular": false,
    "dietaryTags": [
      "gluten-free",
      "dairy-free"
    ],
    "allergens": [],
    "spiceLevel": 2,
    "modifierGroups": []
  },
  {
    "id": "item-fried-momo",
    "categoryId": "cat-main-course-veg",
    "name": "Fried Momo",
    "slug": "item-fried-momo",
    "description": "Chicken, onion, G/G paste, cilantro, scallion, spices. Served with momo chutney and spicy sauce",
    "price": 20,
    "image": "/images/item-fried-momo.jpg",
    "isAvailable": true,
    "isFeatured": true,
    "isPopular": true,
    "dietaryTags": [
      "nut-free"
    ],
    "allergens": [
      "sesame",
      "gluten"
    ],
    "spiceLevel": 2,
    "modifierGroups": [
      {
        "id": "grp-protein-item-fried-momo",
        "name": "Choose Protein",
        "minSelect": 1,
        "maxSelect": 1,
        "modifiers": [
          {
            "id": "mod-chicken-item-fried-momo",
            "name": "Ground Chicken",
            "price": 0,
            "isAvailable": true
          },
          {
            "id": "mod-veg-item-fried-momo",
            "name": "Paneer & Spinach",
            "price": 0,
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "id": "item-steamed-rice",
    "categoryId": "cat-sides-desserts",
    "name": "Steamed Rice",
    "slug": "item-steamed-rice",
    "description": "1 bowl",
    "price": 7,
    "image": "/images/item-steamed-rice.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  },
  {
    "id": "item-carrot-halwa",
    "categoryId": "cat-sides-desserts",
    "name": "Carrot Halwa",
    "slug": "item-carrot-halwa",
    "description": "Gluten free. Carrot, butter, milk, gram flour, sugar",
    "price": 11.9,
    "image": "/images/item-carrot-halwa.jpg",
    "isAvailable": true,
    "isFeatured": false,
    "isPopular": false,
    "dietaryTags": [
      "vegetarian"
    ],
    "allergens": [],
    "spiceLevel": 0,
    "modifierGroups": []
  }
];
  for (const item of itemsData) {
    const dbCategoryId = categoryMap[item.categoryId];
    
    const createdItem = await prisma.menuItem.create({
      data: {
        categoryId: dbCategoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: item.image,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        isPopular: item.isPopular,
        dietaryTags: item.dietaryTags.join(","),
        allergens: item.allergens.join(","),
        spiceLevel: item.spiceLevel,
      },
    });

    // Create modifier group relations if momo
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      for (const group of item.modifierGroups) {
        const createdGroup = await prisma.modifierGroup.create({
          data: {
            name: group.name,
            minSelect: group.minSelect,
            maxSelect: group.maxSelect,
          },
        });

        // link group to item
        await prisma.menuItemModifierGroup.create({
          data: {
            menuItemId: createdItem.id,
            modifierGroupId: createdGroup.id,
          },
        });

        // create modifiers
        for (const mod of group.modifiers) {
          await prisma.modifier.create({
            data: {
              groupId: createdGroup.id,
              name: mod.name,
              price: mod.price,
              isAvailable: mod.isAvailable,
            },
          });
        }
      }
    }
  }

  // Seed jobs
  await prisma.job.create({
    data: {
      title: "Executive Chef / Kitchen Lead",
      location: "Civic Center, San Francisco",
      type: "Full-time",
      schedule: "Wednesday to Sunday",
      salary: "$75k - $90k / year",
      description: "Lead our culinary production, roast mountain spices, and oversee food safety.",
      isPublished: true,
    },
  });

  console.log("Database seeded successfully with local files!");
}

main()
  .catch((e) => {
    console.error("Prisma seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
