const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const outputDir = '/Users/lycoris/test/himalayancuisineco/public/images';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("Launching Brave...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: false,
    defaultViewport: { width: 1280, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  console.log("Navigating to live menu...");
  await page.goto("https://himalayancuisineco.com/menu", { waitUntil: 'load', timeout: 45000 });
  
  console.log("Waiting 10 seconds for Cloudflare verification...");
  await sleep(10000);

  // Scroll page to lazy-load all images & cards
  console.log("Scrolling page to load all items...");
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 250;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });
  await sleep(2000);

  // Extract menu structure
  console.log("Scraping menu items from DOM...");
  const menuItemsFlat = await page.evaluate(() => {
    // Find visible categories H2
    const headings = Array.from(document.querySelectorAll('h2')).map(h => ({
      text: h.innerText ? h.innerText.trim() : "",
      element: h
    })).filter(h => h.text && !h.text.includes("security") && !h.text.includes("verification"));

    // Find all cards using data-testid
    const cards = Array.from(document.querySelectorAll('a[data-testid^="menu-item-card-"]'));
    const parsedList = [];

    cards.forEach((card) => {
      const nameEl = card.querySelector('[data-testid="menu-item-name"]');
      const name = nameEl ? nameEl.innerText.trim() : "";
      if (!name || name.length < 2) return;

      const priceEl = card.querySelector('[data-testid="menu-item-price"]');
      const priceText = priceEl ? priceEl.innerText.replace('$', '').trim() : "15.00";
      const price = parseFloat(priceText) || 15.00;

      // Extract description
      let description = "Traditional Himalayan specialty seasoned with aromatic mountain herbs.";
      const descEls = Array.from(card.querySelectorAll('p, span, div')).filter(el => {
        if (el.children.length > 0) return false;
        const txt = el.innerText ? el.innerText.trim() : "";
        return txt && txt !== name && !txt.startsWith('$') && txt.length > 5;
      });
      if (descEls.length > 0) {
        description = descEls[0].innerText.trim();
      }

      // Extract image URL
      const imgEl = card.querySelector('img');
      let imageUrl = null;
      if (imgEl) {
        imageUrl = imgEl.src || imgEl.getAttribute('src');
      }

      // Find nearest preceding H2 category heading
      const cardRect = card.getBoundingClientRect();
      const cardY = cardRect.top + window.scrollY;

      let nearestCategory = "Other Specialties";
      let minDistance = Infinity;

      headings.forEach(h => {
        const hRect = h.element.getBoundingClientRect();
        const hY = hRect.top + window.scrollY;
        
        if (hY < cardY) {
          const dist = cardY - hY;
          if (dist < minDistance) {
            minDistance = dist;
            nearestCategory = h.text;
          }
        }
      });

      if (imageUrl && !imageUrl.startsWith('data:') && !parsedList.some(it => it.name === name)) {
        parsedList.push({
          category: nearestCategory,
          name,
          description,
          price,
          imageUrl
        });
      }
    });

    return parsedList;
  });

  console.log(`Scraped ${menuItemsFlat.length} menu items flat.`);
  if (menuItemsFlat.length === 0) {
    console.error("Scraper returned empty menu items. Cloudflare or layout changes might have interfered.");
    await browser.close();
    return;
  }

  // Ensure output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Iterate and download all images inside Brave browser context
  const downloadedItems = [];

  for (const item of menuItemsFlat) {
    // Generate clean safe ID
    const safeId = "item-" + item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imgFileName = `${safeId}.jpg`;
    console.log(`Downloading image for ${item.name} from ${item.imageUrl}...`);
    
    const base64Data = await page.evaluate(async (url) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return `ERROR: ${e.message}`;
      }
    }, item.imageUrl);

    if (base64Data.startsWith('ERROR:')) {
      console.error(`Failed to download ${item.name} image: ${base64Data}`);
      continue;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const destPath = path.join(outputDir, imgFileName);
      fs.writeFileSync(destPath, buffer);
      console.log(`Saved ${imgFileName} successfully.`);
      
      downloadedItems.push({
        ...item,
        id: safeId,
        localImage: `/images/${imgFileName}`
      });
    }
    await sleep(200); // Politeness delay
  }

  await browser.close();
  console.log("\nBrowser closed. Writing code updates...");

  // Group items by category
  const groupedMenu = {};
  downloadedItems.forEach(item => {
    if (!groupedMenu[item.category]) {
      groupedMenu[item.category] = [];
    }
    groupedMenu[item.category].push(item);
  });

  const scrapedCategories = Object.keys(groupedMenu).map((catName, idx) => ({
    id: `cat-${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    name: catName,
    slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    order: idx + 1,
    items: groupedMenu[catName]
  }));

  writeCodeUpdates(scrapedCategories);
}

function writeCodeUpdates(scrapedData) {
  // Map categories
  const categoriesCode = scrapedData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    order: cat.order
  }));

  // Map menu items
  const menuItemsCode = [];
  scrapedData.forEach((cat) => {
    cat.items.forEach((item) => {
      const isMomo = cat.slug.includes("momo") || item.name.toLowerCase().includes("momo");
      const isCurry = cat.slug.includes("curry") || cat.slug.includes("main") || item.name.toLowerCase().includes("curry") || item.name.toLowerCase().includes("masala");
      const isSoup = cat.slug.includes("soup") || cat.slug.includes("noodle") || item.name.toLowerCase().includes("thukpa");
      
      menuItemsCode.push({
        id: item.id,
        categoryId: cat.id,
        name: item.name,
        slug: item.id,
        description: item.description,
        price: item.price,
        image: item.localImage,
        isAvailable: true,
        isFeatured: isMomo || isCurry,
        isPopular: isMomo || isSoup,
        dietaryTags: isMomo ? ["nut-free"] : (isCurry ? ["gluten-free", "dairy-free"] : ["vegetarian"]),
        allergens: isMomo ? ["sesame", "gluten"] : [],
        spiceLevel: isCurry ? 2 : (isSoup ? 1 : 0),
        modifierGroups: isMomo ? [
          {
            id: `grp-protein-${item.id}`,
            name: "Choose Protein",
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { id: `mod-chicken-${item.id}`, groupId: `grp-protein-${item.id}`, name: "Ground Chicken", price: 0, isAvailable: true },
              { id: `mod-veg-${item.id}`, groupId: `grp-protein-${item.id}`, name: "Paneer & Spinach", price: 0, isAvailable: true }
            ]
          }
        ] : []
      });
    });
  });

  // Re-write lib/data.ts
  const libDataPath = '/Users/lycoris/test/himalayancuisineco/lib/data.ts';
  const libDataContent = `import { MenuItem, MenuCategory, Review, Job, HimalayanEvent } from "@/types";

export const CATEGORIES: MenuCategory[] = ${JSON.stringify(categoriesCode, null, 2)};

export const MENU_ITEMS: MenuItem[] = ${JSON.stringify(menuItemsCode, null, 2)};

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    customerName: "Devendra Pandey",
    rating: 5,
    comment: "The Jhol Momo is absolutely legendary. Authentic Himalayan spices, warm hospitality, and beautiful visual aesthetics.",
    isFeatured: true,
    createdAt: "2026-08-10T12:00:00Z"
  },
  {
    id: "rev-2",
    customerName: "Sarah M.",
    rating: 5,
    comment: "Glenwood Springs has been waiting for this. The goat curry meat falls off the bone, and the lassi is creamy and perfect.",
    isFeatured: true,
    createdAt: "2026-08-15T12:00:00Z"
  }
];

export const OPEN_JOBS: Job[] = [
  {
    id: "job-chef",
    title: "Executive Chef / Kitchen Lead",
    location: "Civic Center, San Francisco",
    type: "Full-time",
    schedule: "Wednesday to Sunday",
    salary: "$75k - $90k / year",
    description: "Lead our culinary production, manage kitchen inventories, roast and grind our signature mountain spices, and oversee food safety procedures.",
    isPublished: true,
    createdAt: "2026-08-20"
  },
  {
    id: "job-momo",
    title: "Artisanal Momo Wrapper",
    location: "Civic Center, San Francisco",
    type: "Full-time / Part-time",
    schedule: "Flexible scheduling",
    salary: "$22 - $26 / hour",
    description: "Join our specialty momo folding counter. Must be quick and precise, folding standard shapes with consistent wrapper density.",
    isPublished: true,
    createdAt: "2026-08-22"
  }
];

export const MOCK_EVENTS: HimalayanEvent[] = [
  {
    id: "evt-dashain-feast",
    title: "Dashain Festival Harvest Banquet",
    location: "Main Dining Hall",
    type: "Festival Feast",
    schedule: "September 24, 2026 @ 6:00 PM",
    description: "Celebrate the harvest festival of Dashain with a 5-course brass thali platter, live sitar music, and traditional Newari choila starters.",
    isPublished: true,
    createdAt: "2026-08-21"
  },
  {
    id: "evt-momo-masterclass",
    title: "Traditional Momo Hand-folding Workshop",
    location: "Chef's Station Counter",
    type: "Culinary Class",
    schedule: "October 03, 2026 @ 3:00 PM",
    description: "Learn how to wrap, season, and steam authentic Himalayan dumplings from our master momo artisans. Ingredients and drinks included.",
    isPublished: true,
    createdAt: "2026-08-22"
  }
];

export const CATERING_PACKAGES = [
  {
    id: "pkg-sherpa",
    guestCount: "10 GUESTS MINIMUM",
    name: "Sherpa Gathering Momo Bar",
    startingPrice: 18,
    menu: "Artisanal Momo buffet bar featuring Steamed Chicken & Paneer dumplings, Fried Momos, Jhol tomato sesame dipping soup, and spicy chili sauce.",
    serviceStyle: "Momo steamer bar. Keep dumplings piping hot in wooden steamer baskets at your serving table."
  },
  {
    id: "pkg-everest",
    guestCount: "15 GUESTS MINIMUM",
    name: "Everest Base Camp Feast",
    startingPrice: 24,
    menu: "Includes 2 starters (Samosas, Pakoras), 2 signature curries (Chicken Butter Masala, Goat Curry), Rice, Naan, and Kheer dessert.",
    serviceStyle: "Standard buffet tray service. Includes chafing dishes, serving spoons, and recyclable plates."
  },
  {
    id: "pkg-royal",
    guestCount: "25 GUESTS MINIMUM",
    name: "Royal Himalayan Banquet",
    startingPrice: 35,
    menu: "A grand selection of 3 starters, 3 curries (including lamb, fish, and veg options), specialty biryanis, fresh salads, custom naans, and mango cardamom lassi drinks.",
    serviceStyle: "Full staffing option. Includes premium copper serveware setups, buffet table cloths, and server assistance."
  }
];
`;

  fs.writeFileSync(libDataPath, libDataContent);
  console.log("Updated lib/data.ts successfully!");

  // Generate prisma/seed.ts replacement
  generatePrismaSeed(categoriesCode, menuItemsCode);
}

function generatePrismaSeed(categories, items) {
  const seedPath = '/Users/lycoris/test/himalayancuisineco/prisma/seed.ts';
  const seedContent = `import { PrismaClient } from "@prisma/client";
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
  const categoriesData = ${JSON.stringify(categories, null, 2)};
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
  const itemsData = ${JSON.stringify(items, null, 2)};
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
`;

  fs.writeFileSync(seedPath, seedContent);
  console.log("Updated prisma/seed.ts successfully!");
}

run();
