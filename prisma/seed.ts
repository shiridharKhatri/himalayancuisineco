import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

process.env.DATABASE_URL = "file:./prisma/dev.db";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting complete database seeding for Himalayan Cuisine Co...");

  // 1. CLEAR EXISTING DATA (in reverse dependency order)
  await prisma.rewardTransaction.deleteMany();
  await prisma.rewardAccount.deleteMany();
  await prisma.giftCardTransaction.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.cateringRequest.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.eventBooking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.orderItemModifier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.menuItemModifierGroup.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.deliverySetting.deleteMany();

  // 2. SEED USERS & STAFF
  console.log("👤 Seeding Users & Staff...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Tashi Sherpa (Owner & Executive Admin)",
      email: "admin@himalayancuisineco.com",
      password: "adminpassword",
      role: "ADMIN",
    },
  });

  const staffChef = await prisma.user.create({
    data: {
      name: "Pemba Norbu (Head Kitchen Chef)",
      email: "pemba@himalayancuisineco.com",
      password: "staffpassword",
      role: "STAFF",
    },
  });

  const staffHost = await prisma.user.create({
    data: {
      name: "Dawa Dolma (Front of House Lead)",
      email: "dawa@himalayancuisineco.com",
      password: "staffpassword",
      role: "STAFF",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Mingma Lama",
      email: "customer@himalayan.com",
      password: "customerpassword",
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "sarah.jenkins@gmail.com",
      password: "customerpassword",
      role: "CUSTOMER",
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex.rivera@outlook.com",
      password: "customerpassword",
      role: "CUSTOMER",
    },
  });

  // Customer Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        street: "820 Grand Ave, Suite 3",
        city: "Glenwood Springs",
        state: "CO",
        zipCode: "81601",
        isDefault: true,
      },
      {
        userId: customer2.id,
        street: "142 Midland Ave",
        city: "Glenwood Springs",
        state: "CO",
        zipCode: "81601",
        isDefault: true,
      },
      {
        userId: customer3.id,
        street: "305 7th Street",
        city: "Glenwood Springs",
        state: "CO",
        zipCode: "81601",
        isDefault: true,
      },
    ],
  });

  // Reward Accounts
  const reward1 = await prisma.rewardAccount.create({
    data: { userId: customer1.id, points: 280 },
  });
  const reward2 = await prisma.rewardAccount.create({
    data: { userId: customer2.id, points: 150 },
  });

  // 3. SEED DELIVERY SETTINGS
  console.log("📍 Seeding Delivery Settings...");
  await prisma.deliverySetting.create({
    data: {
      id: "default",
      restaurantName: "Himalayan Cuisine",
      address: "115 6th St, Glenwood Springs, CO 81601",
      latitude: 39.5505,
      longitude: -107.3248,
      maxRadiusMiles: 12.0,
      minOrderAmount: 20.0,
      deliveryFee: 4.99,
      freeDeliveryOver: 55.0,
      isDeliveryEnabled: true,
      enforceRadius: true,
      outOfRangeMessage:
        "Sorry, your address is beyond our 12-mile fresh delivery zone. Please consider pickup or call us directly.",
    },
  });

  // 4. SEED MENU CATEGORIES & ITEMS
  console.log("🥟 Seeding Menu Categories & Items...");

  // Shared Modifier Groups
  const spiceGroup = await prisma.modifierGroup.create({
    data: {
      name: "Spice Level",
      minSelect: 1,
      maxSelect: 1,
      modifiers: {
        create: [
          { name: "Mild (Gentle mountain herbs)", price: 0.0, isAvailable: true },
          { name: "Medium (Authentic Himalayan heat)", price: 0.0, isAvailable: true },
          { name: "Hot (Fresh timur pepper & bird-eye chili)", price: 0.0, isAvailable: true },
          { name: "Extra Hot (Himalayan Fire 🔥)", price: 0.0, isAvailable: true },
        ],
      },
    },
    include: { modifiers: true },
  });

  const momoSauceGroup = await prisma.modifierGroup.create({
    data: {
      name: "Dipping Chutney Selection",
      minSelect: 1,
      maxSelect: 2,
      modifiers: {
        create: [
          { name: "Roasted Tomato & Timur Chutney", price: 0.0, isAvailable: true },
          { name: "Spicy Sesame & Peanut Achar", price: 0.0, isAvailable: true },
          { name: "Mint & Fresh Coriander Dip", price: 0.75, isAvailable: true },
          { name: "Extra Spicy Red Chili Paste", price: 0.75, isAvailable: true },
        ],
      },
    },
    include: { modifiers: true },
  });

  const riceGroup = await prisma.modifierGroup.create({
    data: {
      name: "Rice & Bread Pairing",
      minSelect: 0,
      maxSelect: 2,
      modifiers: {
        create: [
          { name: "Steamed Aged Basmati Rice", price: 0.0, isAvailable: true },
          { name: "Garlic Butter Naan (+ $2.50)", price: 2.5, isAvailable: true },
          { name: "Tibetan Tingmo Steamed Bun (+ $2.00)", price: 2.0, isAvailable: true },
          { name: "Jeera Scented Rice (+ $1.50)", price: 1.5, isAvailable: true },
        ],
      },
    },
    include: { modifiers: true },
  });

  // Category 1: Popular Specials
  const catPopular = await prisma.menuCategory.create({
    data: { name: "Popular & Chef Specials", slug: "popular", order: 1 },
  });

  // Category 2: Himalayan Momos
  const catMomos = await prisma.menuCategory.create({
    data: { name: "Himalayan Momos (Dumplings)", slug: "momos", order: 2 },
  });

  // Category 3: Mountain Starters
  const catStarters = await prisma.menuCategory.create({
    data: { name: "Mountain Starters & Sizzlers", slug: "starters", order: 3 },
  });

  // Category 4: Traditional Soups & Thukpa
  const catSoups = await prisma.menuCategory.create({
    data: { name: "Traditional Soups & Thukpa", slug: "soups", order: 4 },
  });

  // Category 5: Himalayan Curries
  const catCurries = await prisma.menuCategory.create({
    data: { name: "Himalayan & Sherpa Curries", slug: "curries", order: 5 },
  });

  // Category 6: Tandoori & Sizzlers
  const catTandoori = await prisma.menuCategory.create({
    data: { name: "Clay Oven Tandoori", slug: "tandoori", order: 6 },
  });

  // Category 7: Biryani & Fragrant Rice
  const catBiryani = await prisma.menuCategory.create({
    data: { name: "Biryani & Mountain Rice", slug: "biryani", order: 7 },
  });

  // Category 8: Naan Breads
  const catNaan = await prisma.menuCategory.create({
    data: { name: "Artisanal Naan & Breads", slug: "breads", order: 8 },
  });

  // Category 9: Desserts & Himalayan Beverages
  const catDrinks = await prisma.menuCategory.create({
    data: { name: "Desserts & Himalayan Teas", slug: "desserts-drinks", order: 9 },
  });

  // Helper to create menu items
  const createdItems: any[] = [];

  const createDish = async (
    catId: string,
    data: {
      name: string;
      slug: string;
      description: string;
      price: number;
      image: string;
      isAvailable?: boolean;
      isFeatured?: boolean;
      isPopular?: boolean;
      dietaryTags?: string[];
      allergens?: string[];
      spiceLevel?: number;
      groups?: any[];
    }
  ) => {
    const item = await prisma.menuItem.create({
      data: {
        categoryId: catId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        image: data.image,
        isAvailable: data.isAvailable ?? true,
        isFeatured: data.isFeatured ?? false,
        isPopular: data.isPopular ?? false,
        dietaryTags: (data.dietaryTags || []).join(","),
        allergens: (data.allergens || []).join(","),
        spiceLevel: data.spiceLevel ?? 1,
      },
    });

    if (data.groups && data.groups.length > 0) {
      for (const grp of data.groups) {
        await prisma.menuItemModifierGroup.create({
          data: {
            menuItemId: item.id,
            modifierGroupId: grp.id,
          },
        });
      }
    }

    createdItems.push(item);
    return item;
  };

  // MOMO DISHES
  const momo1 = await createDish(catMomos.id, {
    name: "Steamed Himalayan Chicken Momo",
    slug: "steamed-chicken-momo",
    description:
      "Handcrafted dumplings filled with spiced ground chicken, fresh ginger, garlic, cilantro, and Himalayan herbs. Served with homemade roasted tomato-timur sesame sauce.",
    price: 15.99,
    image: "/images/hero_momo.jpg",
    isPopular: true,
    isFeatured: true,
    dietaryTags: ["halal", "dairy-free"],
    spiceLevel: 2,
    groups: [spiceGroup, momoSauceGroup],
  });

  const momo2 = await createDish(catMomos.id, {
    name: "Kathmandu Jhol Momo (Soup Dumplings)",
    slug: "kathmandu-jhol-momo",
    description:
      "Steamed chicken or vegetable momos immersed in a piping hot, tangy, and nutty roasted sesame, timur pepper, and tomato broth.",
    price: 17.5,
    image: "/images/hero_soup.jpg",
    isPopular: true,
    isFeatured: true,
    dietaryTags: ["dairy-free"],
    spiceLevel: 2,
    groups: [spiceGroup],
  });

  const momo3 = await createDish(catMomos.id, {
    name: "Pan-Fried Kothey Momo",
    slug: "pan-fried-kothey-momo",
    description:
      "Half-steamed, half pan-crisped crescent dumplings with golden crust bottoms and tender juicy centers.",
    price: 16.5,
    image: "/images/hero_momo.jpg",
    isPopular: true,
    dietaryTags: ["halal"],
    spiceLevel: 1,
    groups: [spiceGroup, momoSauceGroup],
  });

  const momo4 = await createDish(catMomos.id, {
    name: "Crispy Chili C-Momo (Spicy Sautéed)",
    slug: "crispy-chili-c-momo",
    description:
      "Golden fried momos wok-tossed with sweet bell peppers, red onions, ginger, and hot garlic Szechuan-Nepalese chili glaze.",
    price: 17.99,
    image: "/images/hero_momo.jpg",
    dietaryTags: ["dairy-free"],
    spiceLevel: 3,
    groups: [spiceGroup],
  });

  const momo5 = await createDish(catMomos.id, {
    name: "Garden Spinach & Mountain Cheese Momo",
    slug: "spinach-paneer-momo",
    description:
      "Delicate dumplings stuffed with organic spinach, grated paneer cheese, wild mountain herbs, and toasted cumin.",
    price: 15.5,
    image: "/images/hero_momo.jpg",
    dietaryTags: ["vegetarian"],
    spiceLevel: 1,
    groups: [spiceGroup, momoSauceGroup],
  });

  // STARTERS & SIZZLERS
  const starter1 = await createDish(catStarters.id, {
    name: "Charcoal Smoked Chicken Sekuwa",
    slug: "chicken-sekuwa",
    description:
      "Skewered chicken breast marinated in roasted mustard oil, wild Himalayan peppercorns, crushed garlic, and charred over open flame.",
    price: 16.99,
    image: "/images/hero_tandoori.jpg",
    isPopular: true,
    isFeatured: true,
    dietaryTags: ["gluten-free", "halal"],
    spiceLevel: 2,
    groups: [spiceGroup],
  });

  const starter2 = await createDish(catStarters.id, {
    name: "Crispy Himalayan Vegetable Samosas (2 pcs)",
    slug: "vegetable-samosas",
    description:
      "Flaky handcrafted pastry cones stuffed with spiced potatoes, sweet green peas, and whole cumin. Served with tamarind and mint chutney.",
    price: 9.5,
    image: "/images/hero_appetizer.jpg",
    dietaryTags: ["vegetarian", "vegan"],
    spiceLevel: 1,
  });

  // CURRIES
  const curry1 = await createDish(catCurries.id, {
    name: "Slow-Braised Himalayan Goat Curry (Khasi ko Masu)",
    slug: "himalayan-goat-curry",
    description:
      "Tender bone-in goat meat slow-simmered in rich caramelized onion, bay leaf, black cardamom, and whole ground mountain masala gravy.",
    price: 23.99,
    image: "/images/hero_curry.jpg",
    isPopular: true,
    isFeatured: true,
    dietaryTags: ["gluten-free", "halal", "dairy-free"],
    spiceLevel: 3,
    groups: [spiceGroup, riceGroup],
  });

  const curry2 = await createDish(catCurries.id, {
    name: "Classic Chicken Tikka Masala",
    slug: "chicken-tikka-masala",
    description:
      "Clay-oven roasted tandoori chicken tikka simmered in a velvety, creamy tomato, fenugreek, and sweet paprika reduction.",
    price: 19.99,
    image: "/images/hero_curry.jpg",
    isPopular: true,
    dietaryTags: ["gluten-free", "halal"],
    spiceLevel: 1,
    groups: [spiceGroup, riceGroup],
  });

  const curry3 = await createDish(catCurries.id, {
    name: "Kashmiri Lamb Rogan Josh",
    slug: "lamb-rogan-josh",
    description:
      "Tender morsels of Colorado lamb braised in aromatic shallot gravy, Kashmiri sun-dried chilies, cinnamon, and nutmeg.",
    price: 24.5,
    image: "/images/hero_curry.jpg",
    dietaryTags: ["gluten-free", "halal"],
    spiceLevel: 2,
    groups: [spiceGroup, riceGroup],
  });

  const curry4 = await createDish(catCurries.id, {
    name: "Sherpa Dal Bhat & Tarkari Feast",
    slug: "sherpa-dal-bhat",
    description:
      "Traditional brass thali featuring slow-simmered black mountain lentils (Jimbu Dal), spiced seasonal vegetable curry, basmati rice, and pickled radish.",
    price: 18.5,
    image: "/images/hero_curry.jpg",
    isPopular: true,
    dietaryTags: ["vegetarian", "gluten-free", "vegan"],
    spiceLevel: 1,
    groups: [spiceGroup],
  });

  const curry5 = await createDish(catCurries.id, {
    name: "Palak Paneer (Fresh Mountain Spinach)",
    slug: "palak-paneer",
    description:
      "Cubed artisan cottage cheese cooked in silky puréed organic spinach, tempered with cumin seeds, roasted garlic, and light cream.",
    price: 17.99,
    image: "/images/hero_curry.jpg",
    dietaryTags: ["vegetarian", "gluten-free"],
    spiceLevel: 1,
    groups: [spiceGroup, riceGroup],
  });

  // TANDOORI SIZZLERS
  const tandoori1 = await createDish(catTandoori.id, {
    name: "Grand Himalayan Tandoori Mixed Grill",
    slug: "tandoori-mixed-grill",
    description:
      "Sizzling platter of Chicken Tikka, Tandoori Shrimp, Lamb Seekh Kebab, and Charred Sekuwa served over smoking bed of spiced onions and lemon.",
    price: 28.99,
    image: "/images/hero_tandoori.jpg",
    isPopular: true,
    isFeatured: true,
    dietaryTags: ["gluten-free", "halal"],
    spiceLevel: 2,
    groups: [spiceGroup, riceGroup],
  });

  // BIRYANI
  const biryani1 = await createDish(catBiryani.id, {
    name: "Royal Spiced Lamb Biryani",
    slug: "royal-lamb-biryani",
    description:
      "Layered saffron basmati rice with marinated lamb, caramelized onions, toasted cashews, golden raisins, and mint. Served with refreshing cucumber raita.",
    price: 22.99,
    image: "/images/hero_biryani.jpg",
    isPopular: true,
    dietaryTags: ["gluten-free", "halal"],
    spiceLevel: 2,
    groups: [spiceGroup],
  });

  const biryani2 = await createDish(catBiryani.id, {
    name: "Clay Oven Chicken Dum Biryani",
    slug: "chicken-dum-biryani",
    description:
      "Aged basmati rice sealed with pastry and slow-cooked with tender chicken thigh, saffron milk, star anise, and whole cardamom.",
    price: 20.99,
    image: "/images/hero_biryani.jpg",
    dietaryTags: ["gluten-free", "halal"],
    spiceLevel: 2,
    groups: [spiceGroup],
  });

  // NAAN BREADS
  const naan1 = await createDish(catNaan.id, {
    name: "Garlic & Cilantro Butter Naan",
    slug: "garlic-butter-naan",
    description: "Hand-stretched leavened flatbread topped with minced garlic, fresh cilantro, and melted ghee, baked on hot clay tandoor walls.",
    price: 4.99,
    image: "/images/hero_naan.jpg",
    isPopular: true,
    dietaryTags: ["vegetarian"],
  });

  const naan2 = await createDish(catNaan.id, {
    name: "Traditional Tibetan Tingmo (Steamed Twist Bun)",
    slug: "tibetan-tingmo",
    description: "Soft, fluffy flower-shaped steamed Tibetan bread. The quintessential pairing for thick curries and thukpa broths.",
    price: 4.5,
    image: "/images/hero_naan.jpg",
    dietaryTags: ["vegetarian", "vegan"],
  });

  // DRINKS & DESSERTS
  const drink1 = await createDish(catDrinks.id, {
    name: "Alphonso Mango Lassi",
    slug: "alphonso-mango-lassi",
    description: "Creamy cultured yogurt blended with premium Alphonso mango pulp and fragrant crushed green cardamom.",
    price: 5.99,
    image: "/images/hero_drink.jpg",
    isPopular: true,
    dietaryTags: ["vegetarian", "gluten-free"],
  });

  const drink2 = await createDish(catDrinks.id, {
    name: "Himalayan Spiced Masala Chai (Hot)",
    slug: "masala-chai",
    description: "Black mountain CTC tea brewed with whole cinnamon, green cardamom pods, cloves, fresh ginger, and whole milk.",
    price: 4.5,
    image: "/images/hero_drink.jpg",
    dietaryTags: ["vegetarian", "gluten-free"],
  });

  // Also assign items to Popular category
  const popularItemIds = [momo1.id, momo2.id, starter1.id, curry1.id, tandoori1.id, biryani1.id];

  // 5. SEED EVENTS & GUEST BOOKINGS
  console.log("🎉 Seeding Cultural Events & Bookings...");
  const evtDashain = await prisma.event.create({
    data: {
      title: "Dashain Festival Harvest Banquet",
      tagline: "A 5-Course Traditional Harvest Feast with Live Classical Sitar",
      type: "Festival Feast",
      schedule: "October 18, 2026 @ 6:00 PM",
      price: 55.0,
      capacity: 45,
      location: "Main Dining Hall & Heated Mountain Patio",
      image: "/images/event_dashain.jpg",
      description:
        "Celebrate the grand harvest festival of Dashain with an authentic 5-course brass thali banquet, live sitar melodies, traditional Newari choila, slow-braised mountain goat, and festive sweet sel roti.",
      isPublished: true,
    },
  });

  const evtMasterclass = await prisma.event.create({
    data: {
      title: "Traditional Momo Hand-folding Workshop & Tasting",
      tagline: "Master the Art of Himalayan Dumpling Making with Chef Tashi",
      type: "Culinary Class",
      schedule: "November 07, 2026 @ 2:30 PM",
      price: 48.0,
      capacity: 25,
      location: "Chef's Exhibition Counter, 115 6th St",
      image: "/images/event_masterclass.jpg",
      description:
        "Learn how to knead, wrap, season, and pleat authentic round and crescent Himalayan dumplings from our master artisans. Includes hands-on rolling, steaming, dipping chutney workshop, and private tasting feast with paired Himalayan teas.",
      isPublished: true,
    },
  });

  const evtWineDinner = await prisma.event.create({
    data: {
      title: "Himalayan Mountain Wine & Spice Pairing Dinner",
      tagline: "Curated 4-Course High-Altitude Wine Pairing Experience",
      type: "Tasting Dinner",
      schedule: "November 21, 2026 @ 7:00 PM",
      price: 75.0,
      capacity: 35,
      location: "Private Wine Cellar Room",
      image: "/images/catering_private.jpg",
      description:
        "An exclusive evening pairing boutique high-elevation vintages with aromatic smoked tandoori dishes, slow-simmered curries, and artisanal goat cheese flatbreads.",
      isPublished: true,
    },
  });

  // Seed Event Bookings
  await prisma.eventBooking.createMany({
    data: [
      {
        eventId: evtDashain.id,
        customerName: "Sarah Jenkins",
        customerEmail: "sarah.jenkins@gmail.com",
        customerPhone: "(970) 555-0142",
        ticketsCount: 4,
        totalPaid: 220.0,
        notes: "Anniversary celebration, table near live sitar music please.",
        status: "CONFIRMED",
      },
      {
        eventId: evtDashain.id,
        customerName: "David Miller",
        customerEmail: "david.miller@gmail.com",
        customerPhone: "(970) 555-0188",
        ticketsCount: 2,
        totalPaid: 110.0,
        notes: "One vegetarian guest.",
        status: "CONFIRMED",
      },
      {
        eventId: evtMasterclass.id,
        customerName: "Emily Zhao",
        customerEmail: "emily.z@outlook.com",
        customerPhone: "(303) 555-9122",
        ticketsCount: 2,
        totalPaid: 96.0,
        notes: "Excited to learn momo folding!",
        status: "CONFIRMED",
      },
    ],
  });

  // 6. SEED CAREERS & JOB OPENINGS
  console.log("💼 Seeding Job Openings & Candidate Applications...");
  const jobChef = await prisma.job.create({
    data: {
      title: "Head Tandoori & Curry Chef",
      location: "115 6th St, Glenwood Springs, CO 81601",
      type: "Full-time",
      schedule: "Wednesday to Sunday (40 hrs/wk)",
      salary: "$26 - $32 / hour + kitchen bonus",
      description:
        "Lead clay-oven tandoori production, sear authentic skewered sekuwa meats, simmer signature mountain sauces, manage kitchen prep staff, and ensure strict culinary consistency.",
      isPublished: true,
    },
  });

  const jobMomo = await prisma.job.create({
    data: {
      title: "Artisanal Momo Wrapper & Prep Specialist",
      location: "115 6th St, Glenwood Springs, CO 81601",
      type: "Full-time / Part-time",
      schedule: "Flexible Day & Evening Shifts",
      salary: "$20 - $24 / hour",
      description:
        "Hand-fold and pleat our signature chicken, pork, and vegetable momos with precision, portion fillings, and prepare fresh dipping chutneys daily.",
      isPublished: true,
    },
  });

  const jobHost = await prisma.job.create({
    data: {
      title: "Front of House Hospitality Lead & Host",
      location: "115 6th St, Glenwood Springs, CO 81601",
      type: "Full-time",
      schedule: "Thursday to Monday (Evenings)",
      salary: "$20 - $24 / hr + tips ($30+/hr total)",
      description:
        "Warmly welcome arriving guests, manage dining room table seatings, answer customer inquiries, coordinate takeout dispatch, and ensure five-star hospitality.",
      isPublished: true,
    },
  });

  // Seed Job Applications
  await prisma.jobApplication.createMany({
    data: [
      {
        jobId: jobChef.id,
        name: "Karma Gurung",
        email: "karma.gurung@gmail.com",
        phone: "(970) 555-8841",
        resumeUrl: "https://example.com/resumes/karma_gurung.pdf",
        availability: "Full-time (Immediately available)",
        coverLetter: "Over 8 years experience running commercial tandoor ovens and slow-cooked curries in high volume Himalayan restaurants.",
        status: "REVIEWED",
      },
      {
        jobId: jobMomo.id,
        name: "Lhamo Tamang",
        email: "lhamo.t@gmail.com",
        phone: "(970) 555-3211",
        resumeUrl: "https://example.com/resumes/lhamo_tamang.pdf",
        availability: "Part-time (Mornings & Weekends)",
        coverLetter: "Trained in traditional Kathmandu momo workshops. Fast, consistent wrapper with attention to hygiene.",
        status: "INTERVIEWED",
      },
    ],
  });

  // 7. SEED TABLE RESERVATIONS
  console.log("📅 Seeding Table Reservations...");
  await prisma.reservation.createMany({
    data: [
      {
        userId: customer1.id,
        customerName: "Mingma Lama",
        customerEmail: "customer@himalayan.com",
        customerPhone: "(970) 555-0101",
        date: new Date(Date.now() + 1000 * 60 * 60 * 4), // Today dinner
        time: "6:30 PM",
        guests: 4,
        seatingArea: "INDOOR",
        specialOccasion: "Birthday Dinner",
        notes: "Window booth preferred.",
        status: "CONFIRMED",
      },
      {
        userId: customer2.id,
        customerName: "Sarah Jenkins",
        customerEmail: "sarah.jenkins@gmail.com",
        customerPhone: "(970) 555-0142",
        date: new Date(Date.now() + 1000 * 60 * 60 * 28), // Tomorrow
        time: "7:00 PM",
        guests: 2,
        seatingArea: "OUTDOOR",
        specialOccasion: "Anniversary",
        notes: "Heated patio table please.",
        status: "CONFIRMED",
      },
      {
        customerName: "Robert Vance",
        customerEmail: "robert.vance@corporate.com",
        customerPhone: "(303) 555-7799",
        date: new Date(Date.now() + 1000 * 60 * 60 * 52),
        time: "6:00 PM",
        guests: 8,
        seatingArea: "PRIVATE",
        specialOccasion: "Team Celebration",
        notes: "Pre-order momo platters upon arrival.",
        status: "PENDING",
      },
    ],
  });

  // 8. SEED CATERING REQUESTS
  console.log("🥘 Seeding Catering Requests...");
  await prisma.cateringRequest.createMany({
    data: [
      {
        userId: customer3.id,
        customerName: "Alex Rivera (Glenwood Tech Hub)",
        customerEmail: "alex.rivera@outlook.com",
        customerPhone: "(970) 555-9922",
        eventType: "Corporate Luncheon & Networking",
        guestCount: 65,
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        location: "Glenwood Community Center Ballroom",
        menuPreference: "Himalayan Thali Buffet (Chicken Tikka, Goat Curry, Momos, Samosas)",
        dietaryNeeds: "12 Vegetarian, 5 Gluten-Free",
        servicesNeeded: "full-service,buffet-setup,bartending",
        notes: "Hot chaffing dish setup required by 11:30 AM sharp.",
        estimatedPrice: 1850.0,
        status: "QUOTE_SENT",
      },
      {
        customerName: "Elena Rostova",
        customerEmail: "elena.r@aspenweddings.com",
        customerPhone: "(970) 555-4300",
        eventType: "Wedding Rehearsal Dinner",
        guestCount: 40,
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        location: "Roaring Fork Riverhouse Estate",
        menuPreference: "Clay Oven Sizzler & Momo Tasting Station",
        dietaryNeeds: "Halal options needed",
        servicesNeeded: "chef-on-site,buffet-setup",
        notes: "Live momo steaming and tandoori station.",
        estimatedPrice: 1600.0,
        status: "CONFIRMED",
      },
    ],
  });

  // 9. SEED GIFT CARDS
  console.log("🎁 Seeding Gift Cards...");
  const gc1 = await prisma.giftCard.create({
    data: {
      code: "HIMALAYAN-FEAST-9921",
      balance: 75.0,
      initialBalance: 100.0,
      isActive: true,
      senderId: customer1.id,
      senderName: "Mingma Lama",
      recipientName: "Tenzing Norgay",
      recipientEmail: "tenzing@mountain.com",
      message: "Enjoy the best momos and curry in Colorado!",
      cardStyle: "birthday",
      transactions: {
        create: [
          { amount: 100.0, description: "Gift card purchased online" },
          { amount: -25.0, description: "Redeemed on Order #HK-1092" },
        ],
      },
    },
  });

  const gc2 = await prisma.giftCard.create({
    data: {
      code: "HIMALAYAN-HOLIDAY-4402",
      balance: 150.0,
      initialBalance: 150.0,
      isActive: true,
      senderName: "Sarah Jenkins",
      recipientName: "Marcus Brody",
      recipientEmail: "m.brody@colorado.edu",
      message: "Happy Holidays! Treat yourself to a warm Himalayan feast.",
      cardStyle: "holiday",
      transactions: {
        create: [
          { amount: 150.0, description: "Gift card purchased online" },
        ],
      },
    },
  });

  // 10. SEED SAMPLE ORDERS & ANALYTICS DATA
  console.log("🛒 Seeding Orders & Kitchen Queue...");

  const createOrder = async (
    orderId: string,
    userId: string | null,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    type: "PICKUP" | "DELIVERY",
    status: "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED",
    items: { item: any; quantity: number }[],
    daysAgo: number
  ) => {
    let subtotal = 0;
    for (const i of items) {
      subtotal += i.item.price * i.quantity;
    }
    const tax = +(subtotal * 0.088).toFixed(2);
    const deliveryFee = type === "DELIVERY" ? 4.99 : 0.0;
    const tip = +(subtotal * 0.15).toFixed(2);
    const total = +(subtotal + tax + deliveryFee + tip).toFixed(2);

    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 3600000));

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        type,
        status,
        deliveryStreet: type === "DELIVERY" ? "142 Midland Ave" : null,
        deliveryCity: type === "DELIVERY" ? "Glenwood Springs" : null,
        deliveryState: type === "DELIVERY" ? "CO" : null,
        deliveryZip: type === "DELIVERY" ? "81601" : null,
        deliveryFee,
        subtotal,
        tax,
        tip,
        total,
        paymentStatus: "PAID",
        stripeIntentId: `pi_seed_${orderId.toLowerCase()}`,
        createdAt,
        items: {
          create: items.map((i) => ({
            menuItemId: i.item.id,
            quantity: i.quantity,
            price: i.item.price,
          })),
        },
      },
    });

    return order;
  };

  // Orders across past 7 days
  await createOrder("HC-8801", customer1.id, "Mingma Lama", "customer@himalayan.com", "(970) 555-0101", "DELIVERY", "COMPLETED", [
    { item: momo1, quantity: 2 },
    { item: curry1, quantity: 1 },
    { item: naan1, quantity: 2 },
    { item: drink1, quantity: 2 },
  ], 6);

  await createOrder("HC-8802", customer2.id, "Sarah Jenkins", "sarah.jenkins@gmail.com", "(970) 555-0142", "PICKUP", "COMPLETED", [
    { item: starter1, quantity: 1 },
    { item: curry2, quantity: 1 },
    { item: naan1, quantity: 2 },
  ], 5);

  await createOrder("HC-8803", customer3.id, "Alex Rivera", "alex.rivera@outlook.com", "(970) 555-9922", "DELIVERY", "COMPLETED", [
    { item: momo2, quantity: 2 },
    { item: biryani1, quantity: 1 },
    { item: naan1, quantity: 1 },
  ], 4);

  await createOrder("HC-8804", customer1.id, "Mingma Lama", "customer@himalayan.com", "(970) 555-0101", "PICKUP", "COMPLETED", [
    { item: tandoori1, quantity: 1 },
    { item: curry4, quantity: 1 },
    { item: naan1, quantity: 2 },
  ], 3);

  await createOrder("HC-8805", null, "Jennifer Lawrence", "jennifer.l@gmail.com", "(970) 555-3388", "DELIVERY", "COMPLETED", [
    { item: momo1, quantity: 3 },
    { item: starter2, quantity: 2 },
    { item: drink1, quantity: 3 },
  ], 2);

  await createOrder("HC-8806", customer2.id, "Sarah Jenkins", "sarah.jenkins@gmail.com", "(970) 555-0142", "DELIVERY", "COMPLETED", [
    { item: curry1, quantity: 2 },
    { item: biryani2, quantity: 1 },
    { item: naan1, quantity: 3 },
  ], 1);

  // Active Kitchen Queue for Today
  await createOrder("HC-8807", customer1.id, "Mingma Lama", "customer@himalayan.com", "(970) 555-0101", "DELIVERY", "PREPARING", [
    { item: momo1, quantity: 2 },
    { item: momo3, quantity: 1 },
    { item: curry2, quantity: 1 },
    { item: naan1, quantity: 2 },
  ], 0);

  await createOrder("HC-8808", null, "Michael Chen", "mchen@coloradomtn.edu", "(970) 555-7711", "PICKUP", "PREPARING", [
    { item: starter1, quantity: 1 },
    { item: biryani1, quantity: 1 },
    { item: naan1, quantity: 1 },
  ], 0);

  await createOrder("HC-8809", customer3.id, "Alex Rivera", "alex.rivera@outlook.com", "(970) 555-9922", "DELIVERY", "CONFIRMED", [
    { item: momo2, quantity: 2 },
    { item: curry5, quantity: 1 },
    { item: drink1, quantity: 2 },
  ], 0);

  console.log("✅ 100% Database Seeding Complete! All models, relationships, items, events, jobs, orders, and users populated.");
}

main()
  .catch((e) => {
    console.error("❌ Prisma seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
