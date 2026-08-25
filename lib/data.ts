import { MenuItem, MenuCategory, Review, Job, HimalayanEvent } from "@/types";

export const CATEGORIES: MenuCategory[] = [
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

export const MENU_ITEMS: MenuItem[] = [
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
            "groupId": "grp-protein-item-fried-momo",
            "name": "Ground Chicken",
            "price": 0,
            "isAvailable": true
          },
          {
            "id": "mod-veg-item-fried-momo",
            "groupId": "grp-protein-item-fried-momo",
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
