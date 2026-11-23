import { Category, Coupon, Product, StoreSettings, SubscriptionPackage } from '../types';

export const BRAND_LOGO_URL = '/assets/aistudio/IMG-20251110-WA0027_1__3eefc1c0.jpg';

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  caption: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-beans-grains',
    image: '/assets/hero/slide_beans_grains.jpg',
    alt: 'Nigerian market display of beans, parboiled rice and whole grains',
    caption: 'Stone-Free Rice, Honey Beans & Grains',
  },
  {
    id: 'slide-peppers-onions',
    image: '/assets/hero/slide_peppers_onions.jpg',
    alt: 'Fresh red and yellow peppers, onions and tomatoes at market stall',
    caption: 'Fresh Tomatoes, Peppers & Farm Vegetables',
  },
  {
    id: 'slide-fresh-fish',
    image: '/assets/hero/slide_fresh_fish.jpg',
    alt: 'Fresh mackerel and fish varieties displayed on ice',
    caption: 'Frozen Titus Mackerel, Catfish & Seafood',
  },
  {
    id: 'slide-fresh-meat',
    image: '/assets/hero/slide_fresh_meat.jpg',
    alt: 'Fresh butchered beef cuts prepared for delivery',
    caption: 'Chilled Beef, Chicken & Turkey Cuts',
  },
  {
    id: 'slide-grocery-produce',
    image: '/assets/hero/slide_grocery_produce.jpg',
    alt: 'Supermarket grocery produce and pantry foodstuffs',
    caption: 'Weekly & Monthly Household Pantry Restocks',
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  ngnPerAud: 1050,
  ngDeliveryFee: 4500,
  auDeliveryFee: 14.95,
  ngFreeDeliveryThreshold: 120000,
  auFreeDeliveryThreshold: 180,
  pssEnabled: true,
  pssDefaultDepositPercent: 30,
  pssMinOrderNGN: 25000,
  pssMinOrderAUD: 45,
  pssReleaseThresholdPercent: 100,
  pssMaxPeriods: 4,
  pssAllowedFrequencies: ['weekly', 'biweekly', 'monthly'],
  subscriptionDiscountPercent: 8,
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": "rice-and-grains",
    "name": "Rice & Grains",
    "slug": "rice-and-grains",
    "description": "Royal Stallion, Caprice, Big Bull parboiled rice, Basmati & local Nigerian rice.",
    "subcategories": [
      "Parboiled Rice",
      "Basmati Rice",
      "Local Rice"
    ],
    "sortOrder": 1
  },
  {
    "id": "beans-and-legumes",
    "name": "Beans & Legumes",
    "slug": "beans-and-legumes",
    "description": "Picked Oloyin honey beans, Olotu beans, and Nigerian brown beans.",
    "subcategories": [
      "Oloyin & Honey Beans",
      "Olotu & Brown Beans"
    ],
    "sortOrder": 2
  },
  {
    "id": "garri-and-flour",
    "name": "Garri & Flour",
    "slug": "garri-and-flour",
    "description": "Crispy Ijebu white garri, yellow garri, Golden Penny Garri & Semovita.",
    "subcategories": [
      "Ijebu & Yellow Garri",
      "Packaged Garri",
      "Semovita & Swallow"
    ],
    "sortOrder": 3
  },
  {
    "id": "cooking-oils",
    "name": "Cooking Oils",
    "slug": "cooking-oils",
    "description": "Pure red palm oil, Okomu Banga palm oil, Power Oil & Mamador vegetable oil.",
    "subcategories": [
      "Red Palm Oil",
      "Vegetable Oil"
    ],
    "sortOrder": 4
  },
  {
    "id": "meat-and-poultry",
    "name": "Meat & Poultry",
    "slug": "meat-and-poultry",
    "description": "Frozen chicken laps, drumsticks, whole chicken, turkey wings & fresh cut beef.",
    "subcategories": [
      "Chicken",
      "Turkey",
      "Beef"
    ],
    "sortOrder": 5
  },
  {
    "id": "frozen-foods",
    "name": "Frozen Foods",
    "slug": "frozen-foods",
    "description": "Frozen mixed vegetables, Sympli yam fries, chicken nuggets & frankfurters.",
    "subcategories": [
      "Frozen Vegetables",
      "Frozen Yam & Sides",
      "Frozen Snacks",
      "Sausages & Franks"
    ],
    "sortOrder": 6
  },
  {
    "id": "seafood-and-fish",
    "name": "Seafood & Fish",
    "slug": "seafood-and-fish",
    "description": "Frozen & smoked Titus mackerel, cut-up catfish, smoked catfish, mangala & cleaned snails.",
    "subcategories": [
      "Titus Mackerel",
      "Catfish",
      "Smoked Fish",
      "Dried Fish",
      "Snails & Shellfish"
    ],
    "sortOrder": 7
  },
  {
    "id": "vegetables",
    "name": "Vegetables",
    "slug": "vegetables",
    "description": "Firm tomatoes, De Rica & Gino tomato paste, red onions, fresh okra & Ugwu.",
    "subcategories": [
      "Fresh Tomatoes",
      "Tomato Paste",
      "Onions",
      "Okra & Leafy Greens"
    ],
    "sortOrder": 8
  },
  {
    "id": "spices-and-seasonings",
    "name": "Spices & Seasonings",
    "slug": "spices-and-seasonings",
    "description": "Maggi Star, Knorr cubes, machine-peeled Egusi, whole crayfish, smoked prawns & Cameroon pepper.",
    "subcategories": [
      "Seasoning Cubes",
      "Egusi & Soup Condiments",
      "Crayfish & Prawns",
      "Peppers & Spices"
    ],
    "sortOrder": 9
  },
  {
    "id": "drinks-and-beverages",
    "name": "Drinks & Beverages",
    "slug": "drinks-and-beverages",
    "description": "Malta Guinness, Coca-Cola, 5 Alive, Peak Milk, Milo & Nestle Pure Life water.",
    "subcategories": [
      "Malt & Soft Drinks",
      "Juices",
      "Milk & Dairy",
      "Cocoa & Tea",
      "Water"
    ],
    "sortOrder": 10
  },
  {
    "id": "snacks-and-groceries",
    "name": "Snacks & Groceries",
    "slug": "snacks-and-groceries",
    "description": "Indomie noodles cartons, Golden Penny spaghetti, Golden Morn, McVitie’s & Maryland cookies.",
    "subcategories": [
      "Noodles & Pasta",
      "Breakfast Cereals",
      "Biscuits & Snacks"
    ],
    "sortOrder": 11
  },
  {
    "id": "foodstuff-bundles-hampers",
    "name": "Bundles & Hampers",
    "slug": "foodstuff-bundles-hampers",
    "description": "Ready-to-ship value hampers and luxury gift boxes eligible for Pay Small Small.",
    "subcategories": [
      "Luxury & Family Hampers",
      "Value Food Hampers"
    ],
    "sortOrder": 12
  },
  {
    "id": "human-hair-wigs",
    "name": "Wigs & Human Hair",
    "slug": "human-hair-wigs",
    "description": "Virgin bone-straight HD lace frontals & curly closure wigs.",
    "subcategories": [
      "Lace Frontal Wigs"
    ],
    "sortOrder": 13
  },
  {
    "id": "native-attires",
    "name": "Native Attires",
    "slug": "native-attires",
    "description": "Tailored Senator suits, wax Ankara outfits & Aso-Oke gele sets.",
    "subcategories": [
      "Men Senator & Agbada",
      "Ankara & Resort Wear",
      "Aso-Oke & Gele"
    ],
    "sortOrder": 14
  },
  {
    "id": "shoes-sandals-slippers",
    "name": "Shoes & Slippers",
    "slug": "shoes-sandals-slippers",
    "description": "Handcrafted Nigerian leather palms & executive calfskin penny loafers.",
    "subcategories": [
      "Leather Palms & Sandals",
      "Men Loafers & Brogues"
    ],
    "sortOrder": 15
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "sm-royal-stallion-parboiled-rice-50-kg",
    "sku": "SM-001",
    "name": "Royal Stallion Parboiled Rice 50 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Parboiled Rice",
    "description": "Royal Stallion Parboiled Rice is one of the most sought-after rice in Nigeria cause of it's premium quality and affordability. Parboiled rice is an easy cook rice, doesn't have much dirt in it and it becomes resistant to weevils. It is partially precooked in its",
    "priceNGN": 71000,
    "priceAUD": 98,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcgri545.jpg?v=1699457558"
    ],
    "unit": "50 kg Bag",
    "variants": [
      "50 kg Bag"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 25,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 12
  },
  {
    "id": "sm-royal-stallion-thai-parboiled-rice-25-kg-local",
    "sku": "SM-002",
    "name": "Royal Stallion Parboiled Rice 25 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Parboiled Rice",
    "description": "Royal Stallion Parboiled Rice is one of the most sought-after rice in Nigeria cause of it's premium quality and affordability. Parboiled rice is an easy cook rice, doesn't have much dirt in it and it becomes resistant to weevils. It is partially precooked in its",
    "priceNGN": 36000,
    "priceAUD": 49.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcgri544.png?v=1699458797"
    ],
    "unit": "25 kg Bag",
    "variants": [
      "25 kg Bag"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 13
  },
  {
    "id": "sm-royal-stallion-thai-parboiled-rice-10-kg-imported",
    "sku": "SM-003",
    "name": "Royal Stallion Parboiled Rice 10 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Parboiled Rice",
    "description": "Put some variety in your meals and infuse rice when planning dishes for the week. You can cook your rice in so many ways and that's what makes them so popular with kids and adults. Rice a favourite Nigerian staple and is eaten several times a week by most people.",
    "priceNGN": 15500,
    "priceAUD": 21.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/drtb183.jpg?v=1699457517"
    ],
    "unit": "10 kg Bag",
    "variants": [
      "10 kg Bag"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 14
  },
  {
    "id": "sm-caprice-rice-50-kg-imported",
    "sku": "SM-004",
    "name": "Caprice Parboiled Rice 50 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Parboiled Rice",
    "description": "Put some variety in your meals and infuse rice when planning dishes for the week. You can cook your rice in so many ways and that's what makes them so popular with kids and adults. Rice a favourite Nigerian staple and is eaten several times a week by most people. Best P",
    "priceNGN": 71000,
    "priceAUD": 98,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmt1362.jpg?v=1794594751"
    ],
    "unit": "50 kg Bag",
    "variants": [
      "50 kg Bag"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 25,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 15
  },
  {
    "id": "sm-caprice-rice-5-kg-imported",
    "sku": "SM-005",
    "name": "Caprice Parboiled Rice 5 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Parboiled Rice",
    "description": "Put some variety in your meals and infuse rice when planning dishes for the week. You can cook your rice in so many ways and that's what makes them so popular with kids and adults. Rice a favourite Nigerian staple and is eaten several times a week by most people. Best Pl",
    "priceNGN": 9000,
    "priceAUD": 12.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmt1360_2357a81f-a4a1-4c6f-8deb-3587f2402a6f.jpg?v=1794594927"
    ],
    "unit": "5 kg Bag",
    "variants": [
      "5 kg Bag"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 16
  },
  {
    "id": "sm-big-bull-nigerian-parboiled-rice-25-kg",
    "sku": "SM-006",
    "name": "Big Bull Parboiled Rice 25 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Parboiled Rice",
    "description": "Parboiled rice is an easy cook rice, doesnt have much dirt in it and it becomes resistant to weevils. It is partially precooked in its inedible husk before being processed for eating. The basic steps for parboiling is just soaking, steaming and drying. Parboiled rice i",
    "priceNGN": 40320,
    "priceAUD": 55.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/SPARNW298.jpg?v=1689903732"
    ],
    "unit": "25 kg Bag",
    "variants": [
      "25 kg Bag"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 17
  },
  {
    "id": "sm-tropical-sun-golden-sella-basmati-rice-5-kg",
    "sku": "SM-007",
    "name": "Tropical Sun Golden Sella Basmati Rice 5 kg",
    "categoryId": "rice-and-grains",
    "subcategory": "Basmati Rice",
    "description": "Put some variety in your meals and infuse rice when planning dishes for the week. You can cook your rice in so many ways and that's what makes them so popular with kids and adults. Basmati rice h",
    "priceNGN": 27500,
    "priceAUD": 38,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/HBM2224.jpg?v=1756131885"
    ],
    "unit": "5 kg Pack",
    "variants": [
      "5 kg Pack"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 18
  },
  {
    "id": "sm-rice-4-l-local",
    "sku": "SM-008",
    "name": "Rice - Local (Paint Bucket)",
    "categoryId": "rice-and-grains",
    "subcategory": "Local Rice",
    "description": "Rice - Local (Paint Bucket) is brown rice that is loaded with powerful antioxidants which provide relief from a range of ailments such as hypertension, unhealthy levels of cholesterol, stress, mental depression",
    "priceNGN": 8400,
    "priceAUD": 11.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/rspwxyz58_rice_4_l_300x300_129x170_11448110-9e38-4e67-91c3-503bf416a613.jpg?v=1689074864"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 19
  },
  {
    "id": "sm-beans-oloyin-4-l",
    "sku": "SM-009",
    "name": "Beans - Oloyin (Paint Bucket)",
    "categoryId": "beans-and-legumes",
    "subcategory": "Oloyin & Honey Beans",
    "description": "Oloyin beans are very nutritious and allow you add variety to your diet. Olotu beans are an excellent source of protein and other nutrients. Beans can be cooked in a variety of ways depending on your diet and",
    "priceNGN": 9250,
    "priceAUD": 13,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/rspwxyz13.jpg?v=1759240627"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 20
  },
  {
    "id": "sm-beans-olotu-4-l",
    "sku": "SM-010",
    "name": "Beans - Olotu (Paint Bucket)",
    "categoryId": "beans-and-legumes",
    "subcategory": "Olotu & Brown Beans",
    "description": "Oloyin beans are very nutritious and allow you add variety to your diet. Olotu beans are an excellent source of protein and other nutrients. Beans can be cooked in a variety of ways depending on your diet and t",
    "priceNGN": 8000,
    "priceAUD": 11,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/rspwxyz12.jpg?v=1759240581"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 21
  },
  {
    "id": "sm-nini-foods-honey-beans-2-kg",
    "sku": "SM-011",
    "name": "Nini Foods Honey Beans 2 kg",
    "categoryId": "beans-and-legumes",
    "subcategory": "Oloyin & Honey Beans",
    "description": "Oloyin beans are very nutritious and allow you add variety to your diet. Olotu beans are an excellent source of protein and other nutrients. Beans can be cooked in a variety of ways depending on your diet and ta",
    "priceNGN": 13890,
    "priceAUD": 19,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spasho2086_8270f73a-7ec6-40ef-827a-d1075b9155e2.jpg?v=1738324726"
    ],
    "unit": "2 kg Pack",
    "variants": [
      "2 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 22
  },
  {
    "id": "sm-tiwa-n-tiwa-honey-beans-3-2-kg",
    "sku": "SM-012",
    "name": "Tiwa N Tiwa Honey Beans 3.2 kg",
    "categoryId": "beans-and-legumes",
    "subcategory": "Oloyin & Honey Beans",
    "description": "Oloyin beans are very nutritious and allow you add variety to your diet. Olotu beans are an excellent source of protein and other nutrients. Beans can be cooked in a variety of ways depending on your diet and",
    "priceNGN": 14390,
    "priceAUD": 20,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmex3517_9bbec72e-0f14-448b-a3e8-7f2bbf857cd6.jpg?v=1738324724"
    ],
    "unit": "3.2 kg Pack",
    "variants": [
      "3.2 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 23
  },
  {
    "id": "sm-abebi-brown-beans-1-kg",
    "sku": "SM-013",
    "name": "Abebi Brown Beans 1 kg",
    "categoryId": "beans-and-legumes",
    "subcategory": "Olotu & Brown Beans",
    "description": "Brown beans are very nutritious and allow you add variety to your diet. Brown beans are an excellent source of protein and other nutrients. Beans can be cooked in a variety of ways depending on your diet and taste. B",
    "priceNGN": 5695,
    "priceAUD": 8,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spasho977_c1f59f83-0fc6-4ca2-9911-c4bd29de2743.jpg?v=1738324767"
    ],
    "unit": "1 kg Pack",
    "variants": [
      "1 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 24
  },
  {
    "id": "sm-double-t-brown-honey-beans-2-kg",
    "sku": "SM-014",
    "name": "Double T Brown Honey Beans 2 kg",
    "categoryId": "beans-and-legumes",
    "subcategory": "Oloyin & Honey Beans",
    "description": "Oloyin beans are very nutritious and allow you add variety to your diet. Olotu beans are an excellent source of protein and other nutrients. Beans can be cooked in a variety of ways depending on your diet an",
    "priceNGN": 10995,
    "priceAUD": 15,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/products/spar10774.jpg?v=1688377858"
    ],
    "unit": "2 kg Pack",
    "variants": [
      "2 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 25
  },
  {
    "id": "sm-garri-ijebu-4-l",
    "sku": "SM-015",
    "name": "Garri - Ijebu (Paint Bucket)",
    "categoryId": "garri-and-flour",
    "subcategory": "Ijebu & Yellow Garri",
    "description": "When you need the best ingredients to cook your favourite Nigerian dishes you don't need to stress yourself with visits to the market. Just sit back, browse our online store and find all your Nigerian ingredients here. Whether you're making Nigerian soups, jollof rice o",
    "priceNGN": 2100,
    "priceAUD": 3,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/rspwxyz31_ba8de2de-955a-492c-9aa2-a0728475ae5c.jpg?v=1757501780"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 26
  },
  {
    "id": "sm-garri-yellow-4-l",
    "sku": "SM-016",
    "name": "Garri - Yellow (Paint Bucket)",
    "categoryId": "garri-and-flour",
    "subcategory": "Ijebu & Yellow Garri",
    "description": "Foods that contain a high amount of Trans fats can put you at risk of many health issues including heart problems, strokes, and hypertension. One way to fight this is to eat foods like Garri, which has very low fat. In addition to that, Garri also has a higher amount o",
    "priceNGN": 2800,
    "priceAUD": 4,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/alt1644.jpg?v=1756131820"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 27
  },
  {
    "id": "sm-garri-white-4-l",
    "sku": "SM-017",
    "name": "Garri - White (Paint Bucket)",
    "categoryId": "garri-and-flour",
    "subcategory": "Ijebu & Yellow Garri",
    "description": "When you need the best ingredients to cook your favourite Nigerian dishes you don't need to stress yourself with visits to the market. Just sit back, browse our online store and find all your Nigerian ingredients here. Whether you're making Nigerian soups, jollof rice o",
    "priceNGN": 2600,
    "priceAUD": 3.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/rspwxyz32.jpg?v=1756131945"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 28
  },
  {
    "id": "sm-golden-penny-garri-5-kg",
    "sku": "SM-018",
    "name": "Golden Penny Garri 5 kg",
    "categoryId": "garri-and-flour",
    "subcategory": "Packaged Garri",
    "description": "Golden penny Garri is available in 5kg. The Golden Penny Garri is introduced as an affordable staple food choice for consumers to enjoy with an array of local foods to combine with. It is adjudged swell more than the regular garri as well as Dry &amp; Crunchy and fortified w",
    "priceNGN": 6925,
    "priceAUD": 9.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/SPRSI72810_b0a7005d-626e-4b54-808f-13da080e4370.jpg?v=1756131822"
    ],
    "unit": "5 kg Pack",
    "variants": [
      "5 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 29
  },
  {
    "id": "sm-golden-penny-semovita-5-kg",
    "sku": "SM-019",
    "name": "Golden Penny Semovita 5 kg",
    "categoryId": "garri-and-flour",
    "subcategory": "Semovita & Swallow",
    "description": "In Nigeria, we all love our swallow meals especially when with hot soup. Here are some of the swallow meals on offer - beans flour, amala, elubo, semo, smeovita, semolina, wheat meal, eba, garri, poundo yam, pounded yam, rice flour, plantain flour, ground rice, oat meal.",
    "priceNGN": 9450,
    "priceAUD": 13,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcgfl1180_465c9b58-3d35-441b-803c-b6aa91a04c43.jpg?v=1756131828"
    ],
    "unit": "5 kg Pack",
    "variants": [
      "5 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 30
  },
  {
    "id": "sm-golden-penny-semovita-10-kg",
    "sku": "SM-020",
    "name": "Golden Penny Semovita 10 kg",
    "categoryId": "garri-and-flour",
    "subcategory": "Semovita & Swallow",
    "description": "In Nigeria, we all love our swallow meals especially when with hot soup. Here are some of the swallow meals on offer - beans flour, amala, elubo, semo, smeovita, semolina, wheat meal, eba, garri, poundo yam, pounded yam, rice flour, plantain flour, ground rice, oat meal.",
    "priceNGN": 18530,
    "priceAUD": 25.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/1480589680769_spcgfl1177_golden_penny_semovita_10_kg.jpg?v=1689119830"
    ],
    "unit": "10 kg Bag",
    "variants": [
      "10 kg Bag"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 31
  },
  {
    "id": "sm-palm-oil-5-l",
    "sku": "SM-021",
    "name": "Palm Oil 5 L",
    "categoryId": "cooking-oils",
    "subcategory": "Red Palm Oil",
    "description": "Cooking oil is used for frying, cooking, baking and even dressing meals. We can't do without it in the kitchen. When preparing food, it's unlikely you can make any meal without using some kind of oil or ther other. You should",
    "priceNGN": 12000,
    "priceAUD": 16.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/alt3007.webp?v=1694606291"
    ],
    "unit": "5 L Gallon",
    "variants": [
      "5 L Gallon"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 32
  },
  {
    "id": "sm-palm-oil-15-l",
    "sku": "SM-022",
    "name": "Palm Oil 1.5 L",
    "categoryId": "cooking-oils",
    "subcategory": "Red Palm Oil",
    "description": "Cooking oil is used for frying, cooking, baking and even dressing meals. We can't do without it in the kitchen. When preparing food, it's unlikely you can make any meal without using some kind of oil or ther other. You shoul",
    "priceNGN": 3950,
    "priceAUD": 5.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omkt91106.jpg?v=1692003531"
    ],
    "unit": "1.5 L Bottle",
    "variants": [
      "1.5 L Bottle"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 33
  },
  {
    "id": "sm-okomu-banga-red-palm-oil-4-l",
    "sku": "SM-023",
    "name": "Okomu Banga Red Palm Oil 4 L",
    "categoryId": "cooking-oils",
    "subcategory": "Red Palm Oil",
    "description": "Cooking oil is used for frying, cooking, baking and even dressing meals. We can't do without it in the kitchen. When preparing food, it's unlikely you can make any meal without using some kind of oil or ther ot",
    "priceNGN": 15800,
    "priceAUD": 22,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spxspy2324.jpg?v=1756131903"
    ],
    "unit": "4 L Gallon",
    "variants": [
      "4 L Gallon"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 34
  },
  {
    "id": "sm-power-vegetable-oil-45-l",
    "sku": "SM-024",
    "name": "Power Vegetable Oil 4.5 L",
    "categoryId": "cooking-oils",
    "subcategory": "Vegetable Oil",
    "description": "Cooking oil is used for frying, cooking, baking and even dressing meals. We can't do without it in the kitchen. When preparing food, it's unlikely you can make any meal without using some kind of oil or ther other",
    "priceNGN": 22705,
    "priceAUD": 31.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmt3150.jpg?v=1688846867"
    ],
    "unit": "4.5 L Gallon",
    "variants": [
      "4.5 L Gallon"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 35
  },
  {
    "id": "sm-power-vegetable-oil-26-l",
    "sku": "SM-025",
    "name": "Power Vegetable Oil 2.6 L",
    "categoryId": "cooking-oils",
    "subcategory": "Vegetable Oil",
    "description": "Cooking oil is used for frying, cooking, baking and even dressing meals. We can't do without it in the kitchen. When preparing food, it's unlikely you can make any meal without using some kind of oil or ther other",
    "priceNGN": 14605,
    "priceAUD": 20,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcgoi1074.jpg?v=1756131989"
    ],
    "unit": "2.6 L Bottle",
    "variants": [
      "2.6 L Bottle"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 36
  },
  {
    "id": "sm-mamador-pure-vegetable-oil-15-l",
    "sku": "SM-026",
    "name": "Mamador Pure Vegetable Oil 1.5 L",
    "categoryId": "cooking-oils",
    "subcategory": "Vegetable Oil",
    "description": "Mamador Pure Vegetable Oil 1. 5 L Mamador Pure Vegetable Oil is a pure, clean, Cholesterol Free, protein-rich and Vitamins A &amp; E natural cooking oil that is widely used in homes and catering and hospita",
    "priceNGN": 7995,
    "priceAUD": 11,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spxty4169.jpg?v=1763982031"
    ],
    "unit": "1.5 L Bottle",
    "variants": [
      "1.5 L Bottle"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 12
  },
  {
    "id": "sm-chicken-laps-soft-1-kg-frozen",
    "sku": "SM-027",
    "name": "Chicken Laps - Soft ~1 kg - Frozen",
    "categoryId": "meat-and-poultry",
    "subcategory": "Chicken",
    "description": "A slick smear of fried oil can always coat the surface of these crunchy chicken cuts. Breading adds a crisp crust to the exterior, while retaining juices in the meat. when this happens, Its aroma becomes",
    "priceNGN": 6500,
    "priceAUD": 9,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omkt151_frozen_chicken_laps_-_soft_1_kg__market_-_imported.jpg?v=1689076113"
    ],
    "unit": "~1 kg Pack",
    "variants": [
      "~1 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 13
  },
  {
    "id": "sm-chicken-drumstick-1-kg",
    "sku": "SM-028",
    "name": "Chicken Drumstick ~1 kg - Frozen",
    "categoryId": "meat-and-poultry",
    "subcategory": "Chicken",
    "description": "Chicken is a white meat that has typically less fat than other types of meat. If possible, eat your chicken without the skin so you don't consume the fatty parts of the meat. There are so many ways to enjoy",
    "priceNGN": 11150,
    "priceAUD": 15.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmt1419.jpg?v=1689020578"
    ],
    "unit": "~1 kg Pack",
    "variants": [
      "~1 kg Pack"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 14
  },
  {
    "id": "sm-chi-fresh-whole-chicken-11-kg",
    "sku": "SM-029",
    "name": "Chi Fresh Whole Chicken ~1 kg",
    "categoryId": "meat-and-poultry",
    "subcategory": "Chicken",
    "description": "Chicken is a white meat that has typically less fat than other types of meat. If possible, eat your chicken without the skin so you don't consume the fatty parts of the meat. There are so many ways to enjoy chicken",
    "priceNGN": 12550,
    "priceAUD": 17.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/dbk2376.jpg?v=1689020685"
    ],
    "unit": "~1 kg Whole",
    "variants": [
      "~1 kg Whole"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 15
  },
  {
    "id": "sm-turkey-wings-1-kg-frozen",
    "sku": "SM-030",
    "name": "Turkey Wings ~1 kg - Frozen",
    "categoryId": "meat-and-poultry",
    "subcategory": "Turkey",
    "description": "Turkey is a popular choice during major holidays and celebrations like Easter and Christmas. If possible, eat your turkey without the skin so you don't consume the fatty parts of the meat. There are so many ways",
    "priceNGN": 12300,
    "priceAUD": 17,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/altkch005.jpg?v=1695995768"
    ],
    "unit": "~1 kg Pack",
    "variants": [
      "~1 kg Pack"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 16
  },
  {
    "id": "sm-turkey-wings-10-kg-frozen",
    "sku": "SM-031",
    "name": "Turkey Wings ~10 kg - Frozen",
    "categoryId": "meat-and-poultry",
    "subcategory": "Turkey",
    "description": "Turkey wings are soft and tender especially when boiled with spices and seasoning. Turkeys are special among meats due to their unique texture and the mouth watering flavours that they add to food. They can be",
    "priceNGN": 115000,
    "priceAUD": 159,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omkt733_50440553-9c6d-40df-8cd8-35d6e8f10196.jpg?v=1712000543"
    ],
    "unit": "10 kg Carton",
    "variants": [
      "10 kg Carton"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 25,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 17
  },
  {
    "id": "sm-beef-1-kg-cut-up",
    "sku": "SM-032",
    "name": "Beef 1 kg - Cut Up",
    "categoryId": "meat-and-poultry",
    "subcategory": "Beef",
    "description": "Beef is one of the most popular meats in Nigeria. It is a red meat and though it can be a source of nutrients and vitamins, it is best to go for lean cuts of beef that have as little fat as possible. It is very",
    "priceNGN": 7900,
    "priceAUD": 11,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/1506585956674_omwpxyz41_beef__1_kg_-_cut_up__market.jpg?v=1689075915"
    ],
    "unit": "1 kg Cut Up",
    "variants": [
      "1 kg Cut Up"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 18
  },
  {
    "id": "sm-mity-fresh-mixed-vegetables-400-g",
    "sku": "SM-033",
    "name": "Mity Fresh Mixed Vegetables 400 g",
    "categoryId": "frozen-foods",
    "subcategory": "Frozen Vegetables",
    "description": "Mity Fresh Mixed Vegetables 400 g is the combination of different vegetables such as carrots, sweet corn and green peas that have been chopped, sliced and cubed. Mity Fresh Mixed Vegetables are picked at t",
    "priceNGN": 4250,
    "priceAUD": 6,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/Spmt857.jpg?v=1689068117"
    ],
    "unit": "400 g Pack",
    "variants": [
      "400 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 19
  },
  {
    "id": "sm-sympli-african-yam-fries-500-g",
    "sku": "SM-034",
    "name": "Sympli African Yam Fries 500 g",
    "categoryId": "frozen-foods",
    "subcategory": "Frozen Yam & Sides",
    "description": "Sympli Yams are handpicked at their peak goodness, cleaned, peeled, and sliced into readytocook fries. So you don't have to do any peeling, washing or other messy work. All you need to do is to open the packa",
    "priceNGN": 2715,
    "priceAUD": 3.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spdpff2724.jpg?v=1689900739"
    ],
    "unit": "500 g Pack",
    "variants": [
      "500 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 20
  },
  {
    "id": "sm-al-kabeer-chicken-cheese-nuggets-400-g",
    "sku": "SM-035",
    "name": "Al Kabeer Chicken & Cheese Nuggets 400 g",
    "categoryId": "frozen-foods",
    "subcategory": "Frozen Snacks",
    "description": "When we're pressed for time or just plain tired, there's always the option of a packaged ready meal to rescue us. Ready meals are also a fantastic option when we're planning parties and celebrat",
    "priceNGN": 12500,
    "priceAUD": 17.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmex2037.png?v=1756303583"
    ],
    "unit": "400 g Pack",
    "variants": [
      "400 g Pack"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 21
  },
  {
    "id": "sm-al-kabeer-tandoori-chicken-nuggets-270-g",
    "sku": "SM-036",
    "name": "Al Kabeer Tandoori Chicken Nuggets 270 g",
    "categoryId": "frozen-foods",
    "subcategory": "Frozen Snacks",
    "description": "When we're pressed for time or just plain tired, there's always the option of a packaged ready meal to rescue us. Ready meals are also a fantastic option when we're planning parties and celebrations",
    "priceNGN": 7100,
    "priceAUD": 10,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmex2062.jpg?v=1756303582"
    ],
    "unit": "270 g Pack",
    "variants": [
      "270 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 22
  },
  {
    "id": "sm-minu-chicken-franks-340-g-x10",
    "sku": "SM-037",
    "name": "Minu Chicken Franks 340 g x10",
    "categoryId": "frozen-foods",
    "subcategory": "Sausages & Franks",
    "description": "Nothing beats the quality and flavour of a good sausage. Bursting with flavour, these sausages will give your morning taste buds a real treat. Most sausages and frankfurters are either fried, grilled, or micro",
    "priceNGN": 3400,
    "priceAUD": 4.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spxabc509_74fbd8ad-a752-44f8-95d9-86db436b6577.jpg?v=1779358193"
    ],
    "unit": "340 g x10",
    "variants": [
      "340 g x10"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 23
  },
  {
    "id": "sm-titus-fish-x2-frozen",
    "sku": "SM-038",
    "name": "Titus Fish (Mackerel) x2 - Frozen",
    "categoryId": "seafood-and-fish",
    "subcategory": "Titus Mackerel",
    "description": "Seafood is very common in many Nigerian meals. We incorporate fish and other seafood into our dishes either as an ingredient or as an accompaniment to the main dish. Seafood is generally considered to be a",
    "priceNGN": 6900,
    "priceAUD": 9.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omkt701.jpg?v=1690412487"
    ],
    "unit": "2 Whole Fish",
    "variants": [
      "2 Whole Fish"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 24
  },
  {
    "id": "sm-titus-fish-smoked-x1",
    "sku": "SM-039",
    "name": "Titus Fish - Smoked x1",
    "categoryId": "seafood-and-fish",
    "subcategory": "Smoked Fish",
    "description": "Seafood is very common in many Nigerian meals. We incorporate fish and other seafood into our dishes either as an ingredient or as an accompaniment to the main dish. Seafood is generally considered to be a lot health",
    "priceNGN": 2200,
    "priceAUD": 3,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omwpxyz57.jpg?v=1689903540"
    ],
    "unit": "1 Smoked Fish",
    "variants": [
      "1 Smoked Fish"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 25
  },
  {
    "id": "sm-catfish-cut-up",
    "sku": "SM-040",
    "name": "Catfish - Cut Up",
    "categoryId": "seafood-and-fish",
    "subcategory": "Catfish",
    "description": "Seafood is very common in many Nigerian meals. We incorporate fish and other seafood into our dishes either as an ingredient or as an accompaniment to the main dish. Seafood is generally considered to be a lot healthier th",
    "priceNGN": 4500,
    "priceAUD": 6,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/rspwxyz15.jpg?v=1689903535"
    ],
    "unit": "Cut Up Pack",
    "variants": [
      "Cut Up Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 26
  },
  {
    "id": "sm-catfish-smoked-medium-x3",
    "sku": "SM-041",
    "name": "Catfish - Smoked Medium x3",
    "categoryId": "seafood-and-fish",
    "subcategory": "Smoked Fish",
    "description": "Seafood is very common in many Nigerian meals. We incorporate fish and other seafood into our dishes either as an ingredient or as an accompaniment to the main dish. Seafood is generally considered to be a lot he",
    "priceNGN": 3500,
    "priceAUD": 5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omwpxyz30.jpg?v=1689903530"
    ],
    "unit": "3 Medium Fish",
    "variants": [
      "3 Medium Fish"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 27
  },
  {
    "id": "sm-mangala-fish-shredded-small-basket",
    "sku": "SM-042",
    "name": "Mangala Fish - Shredded - Small Basket",
    "categoryId": "seafood-and-fish",
    "subcategory": "Dried Fish",
    "description": "Mangala Fish - Shredded - Small Basket (48hrs Delivery) is, no doubt, one of the most popular delicacies in many Nigerian homes. When it comes to making a choice among stocked fish, M",
    "priceNGN": 7100,
    "priceAUD": 10,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/MILE250_ff0f6e92-8ae4-49a4-a675-984351c84ad0.jpg?v=1756465634"
    ],
    "unit": "Small Basket",
    "variants": [
      "Small Basket"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 28
  },
  {
    "id": "sm-snail-medium-x4-cleaned",
    "sku": "SM-043",
    "name": "Snail - Medium x4 (Cleaned)",
    "categoryId": "seafood-and-fish",
    "subcategory": "Snails & Shellfish",
    "description": "Seafood is very common in many Nigerian meals. We incorporate fish and other seafood into our dishes either as an ingredient or as an accompaniment to the main dish. Seafood is generally considered to be a lot healthier t",
    "priceNGN": 2900,
    "priceAUD": 4,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/sprnw1727.jpg?v=1689076396"
    ],
    "unit": "4 Cleaned Snails",
    "variants": [
      "4 Cleaned Snails"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 29
  },
  {
    "id": "sm-tomatoes-1-kg-firm",
    "sku": "SM-044",
    "name": "Tomatoes 1 kg (Firm)",
    "categoryId": "vegetables",
    "subcategory": "Fresh Tomatoes",
    "description": "If you want to stay healthy, eat your vegetables. No healthy diet is complete with including tomato. You can eat tomato fresh or cook, fry or grill it with a variety of meals. Order yours from us today; we promise they",
    "priceNGN": 2800,
    "priceAUD": 4,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/1504602987194_rspwxyz64_tomatoes_-_big_basket.jpg?v=1689688689"
    ],
    "unit": "1 kg Pack",
    "variants": [
      "1 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 30
  },
  {
    "id": "sm-de-rica-tomato-paste-sachet-70-g-x10",
    "sku": "SM-045",
    "name": "De Rica Tomato Paste Sachet 70 g x10",
    "categoryId": "vegetables",
    "subcategory": "Tomato Paste",
    "description": "De Rica Tomato Paste Sachet 70 g De Rica Tomato Paste Sachet is made from a perfect blend of freshly harvested tomatoes under a very high standard of quality control and hygienic conditions. It is the perfe",
    "priceNGN": 2050,
    "priceAUD": 3,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spxspz2247.png?v=1689130752"
    ],
    "unit": "70 g x10",
    "variants": [
      "70 g x10"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 31
  },
  {
    "id": "sm-gino-magic-peppe-onion-tomato-mix-sachet-70-g-x10",
    "sku": "SM-046",
    "name": "Gino Magic Peppe & Onion Tomato Mix Sachet 70 g x10",
    "categoryId": "vegetables",
    "subcategory": "Tomato Paste",
    "description": "Gino Magic Peppe &amp; Onion Tomato Mix Sachet 70 g Gino Magic Peppe &amp; Onion Tomato Mix Sachet is made from organic grown pepper and onion, blended together to give a distinctive tast",
    "priceNGN": 2050,
    "priceAUD": 3,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/SPRSI73110_3b2ee1cd-a37b-43cc-9965-f439427278db.jpg?v=1689904237"
    ],
    "unit": "70 g x10",
    "variants": [
      "70 g x10"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 32
  },
  {
    "id": "sm-onions-1-kg",
    "sku": "SM-047",
    "name": "Onions 1 kg",
    "categoryId": "vegetables",
    "subcategory": "Onions",
    "description": "If you want to stay healthy, eat your vegetables. They are an essential part of a balanced diet. The onion colour you select is based on personal preference but we have brown onion, white onion and red onion. Some claim that there are health benefits of eating raw onion - though widely",
    "priceNGN": 3900,
    "priceAUD": 5.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spmt1414_a34d4792-be7f-469a-895e-8bfddce3294f.jpg?v=1756131796"
    ],
    "unit": "1 kg Pack",
    "variants": [
      "1 kg Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 33
  },
  {
    "id": "sm-onions-red-small-bowl",
    "sku": "SM-048",
    "name": "Onions - Red - Small Bowl",
    "categoryId": "vegetables",
    "subcategory": "Onions",
    "description": "If you want to stay healthy, eat your vegetables. They are an essential part of a balanced diet. Vegetables contain various nutrients and vitamins. They are also rich in fibre which aid digestion as well as other body functions. Vegetables are low in calor",
    "priceNGN": 29500,
    "priceAUD": 40.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/MILE251.jpg?v=1688725411"
    ],
    "unit": "Small Bowl",
    "variants": [
      "Small Bowl"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 34
  },
  {
    "id": "sm-okra-fresh-4-l",
    "sku": "SM-049",
    "name": "Okra - Fresh (Paint Bucket)",
    "categoryId": "vegetables",
    "subcategory": "Okra & Leafy Greens",
    "description": "Okro - Fresh (Paint Bucket) Dried is a tall-growing vegetable that traces its origin from ancient Ethiopia (Abyssinia) through to Eastern Mediterranea, India, the Americas and the Caribbean. Parts of the plant (",
    "priceNGN": 2000,
    "priceAUD": 3,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/oyingbo016.jpg?v=1689074886"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 35
  },
  {
    "id": "sm-ugwu-whole",
    "sku": "SM-050",
    "name": "Ugwu - Whole",
    "categoryId": "vegetables",
    "subcategory": "Okra & Leafy Greens",
    "description": "When you need the best ingredients to cook your favourite Nigerian dishes you don't need to stress yourself with visits to the market. Just sit back, browse our online store and find all your Nigerian ingredients here. Whether you're making Nigerian soups, jollof rice or other local di",
    "priceNGN": 400,
    "priceAUD": 2.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omwpxyz46.png?v=1689074968"
    ],
    "unit": "Fresh Bunch",
    "variants": [
      "Fresh Bunch"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 36
  },
  {
    "id": "sm-maggi-star-seasoning-cubes-400-g-x100",
    "sku": "SM-051",
    "name": "Maggi Star Seasoning Cubes 400 g x100",
    "categoryId": "spices-and-seasonings",
    "subcategory": "Seasoning Cubes",
    "description": "Bring your food to life with the very best spice and seasoning. Whether you're a masterchef or an amateur cook, your meals shouldn't taste bland. With the right combination of spices and seasoning, you",
    "priceNGN": 1965,
    "priceAUD": 2.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/aspar9000_300x_2x_60bead3d-fb98-4660-a8c4-a667901301fa.webp?v=1690142288"
    ],
    "unit": "400 g (100 Cubes)",
    "variants": [
      "400 g (100 Cubes)"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 12
  },
  {
    "id": "sm-knorr-chicken-cubes-8-g-x50",
    "sku": "SM-052",
    "name": "Knorr Chicken Cubes 8 g x50",
    "categoryId": "spices-and-seasonings",
    "subcategory": "Seasoning Cubes",
    "description": "Knorr Chicken Cubes 8 g x50 is one spice/seasoning that is an everyday and popular staple in most Nigerian homes. It is useful to both amateur and professional chefs for their culinary practices. They are conven",
    "priceNGN": 2430,
    "priceAUD": 3.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/CITD1745.jpg?v=1689105317"
    ],
    "unit": "8 g x50 Pack",
    "variants": [
      "8 g x50 Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 13
  },
  {
    "id": "sm-egusi-machine-peeled-4-l",
    "sku": "SM-053",
    "name": "Egusi - Machine Peeled (Paint Bucket)",
    "categoryId": "spices-and-seasonings",
    "subcategory": "Egusi & Soup Condiments",
    "description": "When you need the best ingredients to cook your favourite Nigerian dishes you don't need to stress yourself with visits to the market. Just sit back, browse our online store and find all your Nigerian",
    "priceNGN": 14500,
    "priceAUD": 20,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/MILE235_fbea2ec2-27b5-44ed-bffe-744af80f741d.jpg?v=1777225933"
    ],
    "unit": "Paint Bucket (4L)",
    "variants": [
      "Paint Bucket (4L)"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 14
  },
  {
    "id": "sm-crayfish-whole-170-g",
    "sku": "SM-054",
    "name": "Crayfish - Whole (Milk Cup)",
    "categoryId": "spices-and-seasonings",
    "subcategory": "Crayfish & Prawns",
    "description": "When you need the best ingredients to cook your favourite Nigerian dishes you don't need to stress yourself with visits to the market. Just sit back, browse our online store and find all your Nigerian ingredient",
    "priceNGN": 1490,
    "priceAUD": 2.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omwpxyz93_cray_fish__white__-_1_cup.jpg?v=1689075043"
    ],
    "unit": "170 g Cup",
    "variants": [
      "170 g Cup"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 15
  },
  {
    "id": "sm-prawn-smoked-big-basket",
    "sku": "SM-055",
    "name": "Prawn - Smoked (Big Basket)",
    "categoryId": "spices-and-seasonings",
    "subcategory": "Crayfish & Prawns",
    "description": "Seafood is very common in many Nigerian meals. We incorporate fish and other seafood into our dishes either as an ingredient or as an accompaniment to the main dish. Seafood is generally considered to be a lot h",
    "priceNGN": 7300,
    "priceAUD": 10,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omwpxyz45_smoked_cray_fish__big_basket.jpg?v=1689075799"
    ],
    "unit": "Big Basket",
    "variants": [
      "Big Basket"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 16
  },
  {
    "id": "sm-cameroon-pepper-850-g",
    "sku": "SM-056",
    "name": "Cameroon Pepper (Derica Cup)",
    "categoryId": "spices-and-seasonings",
    "subcategory": "Peppers & Spices",
    "description": "Cameroon Pepper (Derica Cup) is a powder that is widely used in Nigeria to cook due to its exceptional heat and unique flavour. It is also called Nsukka pepper and Ghana pepper in West Africa and yellow lantern",
    "priceNGN": 3750,
    "priceAUD": 5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/omwpxyz89_cameroon_pepper_850_g.jpg?v=1689105080"
    ],
    "unit": "850 g Derica Cup",
    "variants": [
      "850 g Derica Cup"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 17
  },
  {
    "id": "sm-malta-guinness-can-33-cl-x24",
    "sku": "SM-057",
    "name": "Malta Guinness Can 33 cl x24",
    "categoryId": "drinks-and-beverages",
    "subcategory": "Malt & Soft Drinks",
    "description": "For both kids and adults, a cold soft drink can be a nice treat with meals or to quench thirst on hot sunny days. Whichever flavour you like, you'll be sure to get it here. There are various cola drinks, lemon",
    "priceNGN": 16680,
    "priceAUD": 23,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spack130_malta_guinness_can_33_cl_pack_of_24.jpg?v=1689111979"
    ],
    "unit": "33 cl x24 Carton",
    "variants": [
      "33 cl x24 Carton"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 18
  },
  {
    "id": "sm-coca-cola-coke-pet-bottle-50-cl-x12",
    "sku": "SM-058",
    "name": "Coca Cola Coke Pet Bottle 50 cl x12",
    "categoryId": "drinks-and-beverages",
    "subcategory": "Malt & Soft Drinks",
    "description": "For both kids and adults, a cold soft drink can be a nice treat with meals or to quench thirst on hot sunny days. Whichever flavour you like, you'll be sure to get it here. There are various cola drinks,",
    "priceNGN": 5880,
    "priceAUD": 8,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/OkeA113.jpg?v=1697616026"
    ],
    "unit": "50 cl x12 Pack",
    "variants": [
      "50 cl x12 Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 19
  },
  {
    "id": "sm-five-alive-pulpy-orange-85-cl-x6",
    "sku": "SM-059",
    "name": "5 Alive Pulpy Orange 85 cl x6",
    "categoryId": "drinks-and-beverages",
    "subcategory": "Juices",
    "description": "Five Alive Pulpy Orange is a real fruit beverage. It is an excellent source of Vitamin C and has no artificial colours and flavours added. This refreshing flavour has over 40% real juice and contains orange",
    "priceNGN": 8760,
    "priceAUD": 12,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/products/5-Alive-Pulpy-Orange-85-cl-x6-Supermart-ng-1647.jpg?v=1690439608"
    ],
    "unit": "85 cl x6 Pack",
    "variants": [
      "85 cl x6 Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 20
  },
  {
    "id": "sm-peak-instant-full-cream-milk-powder-sachet-800-g",
    "sku": "SM-060",
    "name": "Peak Instant Full Cream Milk Powder Sachet 800 g",
    "categoryId": "drinks-and-beverages",
    "subcategory": "Milk & Dairy",
    "description": "Peak instant milk powder is rich, creamy and delicious and contains 28 Vitamins and Mineral for stronger bodies and sharper minds and is enriched with Vitamin A; for clear eye sight, Vitamin D3; for development of bones and teeth and Vitamin E; to ke",
    "priceNGN": 10730,
    "priceAUD": 15,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/1111.png?v=1690630382"
    ],
    "unit": "800 g Sachet",
    "variants": [
      "800 g Sachet"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 21
  },
  {
    "id": "sm-milo-food-drink-sachet-800-g",
    "sku": "SM-061",
    "name": "Milo Food Drink Sachet 800 g",
    "categoryId": "drinks-and-beverages",
    "subcategory": "Cocoa & Tea",
    "description": "Starting your morning with a hot cup of cocoa is something we're all familiar with. These yummy chocolately food drinks fill us up and give us the energy and nutrients to go about our busy days. When the cocoa powder melts into the hot water and we stir it up, we know o",
    "priceNGN": 8210,
    "priceAUD": 11.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spxabc458.jpg?v=1689901525"
    ],
    "unit": "800 g Sachet",
    "variants": [
      "800 g Sachet"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 22
  },
  {
    "id": "sm-nestle-pure-life-water-60-cl-x20",
    "sku": "SM-062",
    "name": "Nestle Pure Life Water 60 cl x20",
    "categoryId": "drinks-and-beverages",
    "subcategory": "Water",
    "description": "Nothing refreshes like water. We all love to drink water; the natural taste goes down well with meals of all kind. A glass of water, especially when served cold is perfect for those hot sunny days when we'r",
    "priceNGN": 4850,
    "priceAUD": 6.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/OkeA471_607ce72d-1eae-49d9-87a0-e0ef92feb2a6.jpg?v=1781860376"
    ],
    "unit": "60 cl x20 Pack",
    "variants": [
      "60 cl x20 Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 23
  },
  {
    "id": "sm-indomie-instant-noodles-chicken-70-g-x40",
    "sku": "SM-063",
    "name": "Indomie Instant Noodles Chicken 70 g x40",
    "categoryId": "snacks-and-groceries",
    "subcategory": "Noodles & Pasta",
    "description": "For those days when you can't be bothered or don't have the time to cook, there's no better choice than super fast instant noodles. These noodles require minimal cooking and can be ready in a few mi",
    "priceNGN": 12200,
    "priceAUD": 17,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/OkeA311.jpg?v=1756131892"
    ],
    "unit": "70 g x40 Carton",
    "variants": [
      "70 g x40 Carton"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 24
  },
  {
    "id": "sm-indomie-instant-noodles-onion-chicken-70-g-x40",
    "sku": "SM-064",
    "name": "Indomie Instant Noodles Onion Chicken 70 g x40",
    "categoryId": "snacks-and-groceries",
    "subcategory": "Noodles & Pasta",
    "description": "For those days when you can't be bothered or don't have the time to cook, there's no better choice than super fast instant noodles. These noodles require minimal cooking and can be ready in a",
    "priceNGN": 13000,
    "priceAUD": 18,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/OkeA312_7baeefaf-7d71-45b1-b103-a9a609d83eea.jpg?v=1769429167"
    ],
    "unit": "70 g x40 Carton",
    "variants": [
      "70 g x40 Carton"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 25
  },
  {
    "id": "sm-golden-penny-spaghetti-500-g",
    "sku": "SM-065",
    "name": "Golden Penny Spaghetti 500 g",
    "categoryId": "snacks-and-groceries",
    "subcategory": "Noodles & Pasta",
    "description": "Put some variety in your meals and infuse spaghetti when planning dishes for the week. You can cook your spaghetti in so many ways and that's what makes them so popular with kids and adults. Spaghetti originate",
    "priceNGN": 1295,
    "priceAUD": 2.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcgps892_93a348ef-6256-4d99-bda3-ebbd6bd1b7b0.jpg?v=1756131894"
    ],
    "unit": "500 g Pack",
    "variants": [
      "500 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 26
  },
  {
    "id": "sm-nestle-golden-morn-maize-soya-800-g",
    "sku": "SM-066",
    "name": "Nestle Golden Morn Maize & Soya 800 g",
    "categoryId": "snacks-and-groceries",
    "subcategory": "Breakfast Cereals",
    "description": "Breakfast time is always fun when you know you'll be eating your favourite breakfast cereal. Pick up the box of your cereal, pour in some milk and breakfast is ready. With cereal you don't need to c",
    "priceNGN": 5180,
    "priceAUD": 7,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcgce763.jpg?v=1689900283"
    ],
    "unit": "800 g Pack",
    "variants": [
      "800 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 27
  },
  {
    "id": "sm-mcvities-rich-tea-200-g",
    "sku": "SM-067",
    "name": "McVitie's Rich Tea 200 g",
    "categoryId": "snacks-and-groceries",
    "subcategory": "Biscuits & Snacks",
    "description": "McVitie's Rich Tea 200 g is a smooth combination of an age long British recipe. A sweet and savory round biscuit, enjoy it with a cup of tea. The original name of Rich Tea was Tea Biscuit in the 17th century in Yor",
    "priceNGN": 1400,
    "priceAUD": 2.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/spcsbs1450_mcvities-rich-tea-biscuit-200gm.jpg?v=1688693485"
    ],
    "unit": "200 g Pack",
    "variants": [
      "200 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 28
  },
  {
    "id": "sm-maryland-cookies-choc-chip-136-g",
    "sku": "SM-068",
    "name": "Maryland Cookies Choc Chip 136 g",
    "categoryId": "snacks-and-groceries",
    "subcategory": "Biscuits & Snacks",
    "description": "Enjoy the Maryland Cookies Choc Chip 136 g by experience of smooth chocolate drenched in yummy cream. It has a crush chic choc texture to provide exciting fun for your taste bud. These small cookies are eas",
    "priceNGN": 2240,
    "priceAUD": 3,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/sparxvi000647.jpg?v=1688693625"
    ],
    "unit": "136 g Pack",
    "variants": [
      "136 g Pack"
    ],
    "stock": 40,
    "pssEligible": false,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 29
  },
  {
    "id": "sm-deluxe-hamper",
    "sku": "SM-069",
    "name": "Deluxe Hamper",
    "categoryId": "foodstuff-bundles-hampers",
    "subcategory": "Luxury & Family Hampers",
    "description": "HAMPER CONTENT: Champagne Scotch Whisky Vodka White wine Fox's cookies Chocolate biscuits Pack of imported tea Pack of fruit juice (2) Ribena squash Pack of sweets Packet of powdered milk Pack of oats Pack of cereal Popcorn (2) Digestive biscuits Pringles Baked beans Sardines (2) Wheatmeal (Swallow)",
    "priceNGN": 140000,
    "priceAUD": 193.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms08_e9f1d16c-38fb-434f-a54b-f4d34584d944.jpg?v=1763393493"
    ],
    "unit": "Deluxe Hamper Box",
    "variants": [
      "Deluxe Hamper Box"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 25,
    "subscriptionEligible": true,
    "isBundle": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 30
  },
  {
    "id": "sm-luxury-hamper",
    "sku": "SM-070",
    "name": "Luxury Hamper",
    "categoryId": "foodstuff-bundles-hampers",
    "subcategory": "Luxury & Family Hampers",
    "description": "HAMPER CONTENT: Sparkling wine Rose wine White wine Rich Tea biscuit Chocolate biscuit Crackers biscuit Digestive biscuit Packet of sweets Pack of almonds Spaghetti Macaroni Barilla pasta Vegetable oil 750 ml Tomato ketchup Pack of oats Pack of cereal Can of sweetcorn Pack of fruit juice (2) Packet ",
    "priceNGN": 95000,
    "priceAUD": 131,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms06.jpg?v=1763393437"
    ],
    "unit": "Luxury Hamper Box",
    "variants": [
      "Luxury Hamper Box"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 25,
    "subscriptionEligible": true,
    "isBundle": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 31
  },
  {
    "id": "sm-elegance-hamper",
    "sku": "SM-071",
    "name": "Elegance Hamper",
    "categoryId": "foodstuff-bundles-hampers",
    "subcategory": "Luxury & Family Hampers",
    "description": "HAMPER CONTENT: Red wine Rose wine White wine Rich Tea biscuit Digestive biscuit Chocolate biscuit Wheatmeal (Swallow) Pack of imported tea Tin of sweetcorn Pack of oats Packet of cereal Spaghetti Macaroni Peanut butter Pack of powdered milk Tomato ketchup Baked beans Vegetable oil 750 ml Pack of fr",
    "priceNGN": 85000,
    "priceAUD": 117.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms05.jpg?v=1763393368"
    ],
    "unit": "Elegance Hamper Box",
    "variants": [
      "Elegance Hamper Box"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "isBundle": true,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 32
  },
  {
    "id": "sm-premium-hamper",
    "sku": "SM-072",
    "name": "Premium Hamper",
    "categoryId": "foodstuff-bundles-hampers",
    "subcategory": "Value Food Hampers",
    "description": "HAMPER CONTENT: Red wine White wine Milo 400 g Packet of sweets (2) Lipton tea Popcorn (2) Wheatmeal (Swallow) Macaroni Tomato paste 400 g Peanut butter Golden Morn mini packs (10) Vegetable Oil 750 ml Pack of fruit juice Sardines (2) Baked beans When the yuletide is upon us and we need Christmas gi",
    "priceNGN": 55000,
    "priceAUD": 76,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms03.jpg?v=1763393261"
    ],
    "unit": "Premium Hamper Box",
    "variants": [
      "Premium Hamper Box"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "isBundle": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 33
  },
  {
    "id": "sm-super-saver-hamper",
    "sku": "SM-073",
    "name": "Super Saver Hamper",
    "categoryId": "foodstuff-bundles-hampers",
    "subcategory": "Value Food Hampers",
    "description": "HAMPER CONTENT: Red wine Tomato paste 200 g Popcorn (2) Lipton tea Spaghetti Noodles (2) Vegetable oil 750 ml Pack of fruit juice Sardines (2) Baked beans When the yuletide is upon us and we need Christmas gift ideas for family, friends and staff, theres so much to consider from hamper boxes, fruit ",
    "priceNGN": 35000,
    "priceAUD": 48.5,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms09.jpg?v=1763393534"
    ],
    "unit": "Super Saver Hamper",
    "variants": [
      "Super Saver Hamper"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "isBundle": true,
    "featured": false,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 34
  },
  {
    "id": "sm-carry-go-value-hamper",
    "sku": "SM-074",
    "name": "Carry Go Value Hamper",
    "categoryId": "foodstuff-bundles-hampers",
    "subcategory": "Value Food Hampers",
    "description": "HAMPER CONTENT: Bag of rice 5 kg Cooking oil 750 ml Tomato paste 200 g When the yuletide is upon us and we need Christmas gift ideas for family, friends and staff, theres so much to consider from hamper boxes, fruit hampers, rice and oil and lots more. Theres no such thing as the typical Nigerian Ch",
    "priceNGN": 18000,
    "priceAUD": 25,
    "images": [
      "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms01_716e56ad-3161-4b89-b49f-a5bd27f5bc60.jpg?v=1763393172"
    ],
    "unit": "Carry Go Value Hamper",
    "variants": [
      "Carry Go Value Hamper"
    ],
    "stock": 40,
    "pssEligible": true,
    "pssMinDepositPercent": 30,
    "subscriptionEligible": true,
    "isBundle": true,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 35
  },
  {
    "id": "sc-bone-straight-hd-lace-wig",
    "sku": "SC-WIG-BS24",
    "name": "100% Virgin Bone Straight HD Lace Frontal Wig (24\")",
    "categoryId": "human-hair-wigs",
    "subcategory": "Lace Frontal Wigs",
    "description": "Double-drawn virgin human hair, 13x4 transparent HD Swiss lace frontal, pre-plucked hairline with silky tangle-free lustre.",
    "priceNGN": 245000,
    "priceAUD": 349,
    "images": [
      "/assets/products/wig_bone_straight.jpg"
    ],
    "unit": "24 Inches",
    "variants": [
      "20 Inches",
      "24 Inches",
      "26 Inches"
    ],
    "stock": 18,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.9,
    "reviewCount": 28
  },
  {
    "id": "sc-deep-wave-curly-wig",
    "sku": "SC-WIG-DW20",
    "name": "Peruvian Deep Wave Curly Closure Wig (20\")",
    "categoryId": "human-hair-wigs",
    "subcategory": "Lace Frontal Wigs",
    "description": "Glueless 5x5 HD closure wig with bouncy deep-wave curls and adjustable elastic band. Image flagged for manual studio upload.",
    "priceNGN": 175000,
    "priceAUD": 259,
    "images": [
      "MANUAL_UPLOAD_REQUIRED"
    ],
    "unit": "20 Inches",
    "variants": [
      "18 Inches",
      "20 Inches",
      "22 Inches"
    ],
    "stock": 14,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 14
  },
  {
    "id": "sc-royal-navy-senator-suit",
    "sku": "SC-NAT-SEN1",
    "name": "Royal Navy Cashmere Senator Two-Piece Set",
    "categoryId": "native-attires",
    "subcategory": "Men Senator & Agbada",
    "description": "Precision-tailored Nigerian men’s Senator kaftan and matching trousers in breathable royal navy wool-blend fabric.",
    "priceNGN": 78000,
    "priceAUD": 135,
    "images": [
      "/assets/products/attire_senator.jpg"
    ],
    "unit": "2-Piece Set",
    "variants": [
      "Medium (38)",
      "Large (40)",
      "XL (42)",
      "2XL (44)"
    ],
    "stock": 25,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.9,
    "reviewCount": 21
  },
  {
    "id": "sc-crimson-gold-ankara-set",
    "sku": "SC-NAT-ANK1",
    "name": "Heritage Crimson & Gold Wax Ankara Two-Piece",
    "categoryId": "native-attires",
    "subcategory": "Ankara & Resort Wear",
    "description": "100% cotton high-grade wax Ankara print tailored for Owambe celebrations and cultural events across Nigeria and Australia.",
    "priceNGN": 64000,
    "priceAUD": 115,
    "images": [
      "/assets/products/attire_ankara.jpg"
    ],
    "unit": "Tailored Set",
    "variants": [
      "Medium",
      "Large",
      "XL"
    ],
    "stock": 30,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": true,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 17
  },
  {
    "id": "sc-aso-oke-gele-set",
    "sku": "SC-NAT-ASO1",
    "name": "Handwoven Metallic Aso-Oke Gele & Ipele Set",
    "categoryId": "native-attires",
    "subcategory": "Aso-Oke & Gele",
    "description": "Authentic hand-loomed Yoruba Aso-Oke headwrap and shoulder shawl. Image flagged for manual studio upload.",
    "priceNGN": 45000,
    "priceAUD": 85,
    "images": [
      "MANUAL_UPLOAD_REQUIRED"
    ],
    "unit": "Gele + Ipele",
    "variants": [
      "Royal Navy & Silver",
      "Crimson & Gold"
    ],
    "stock": 19,
    "pssEligible": false,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.9,
    "reviewCount": 11
  },
  {
    "id": "sc-leather-cross-strap-palms",
    "sku": "SC-SHOE-PLM",
    "name": "Handcrafted Full-Grain Leather Cross-Strap Palms",
    "categoryId": "shoes-sandals-slippers",
    "subcategory": "Leather Palms & Sandals",
    "description": "Artisanal vegetable-tanned leather Nigerian palm slippers with cushioned footbed and durable rubber outsole.",
    "priceNGN": 32000,
    "priceAUD": 62,
    "images": [
      "/assets/products/shoes_palms.jpg"
    ],
    "unit": "Pair",
    "variants": [
      "EU 41 / AU 8",
      "EU 42 / AU 9",
      "EU 43 / AU 10",
      "EU 44 / AU 11"
    ],
    "stock": 46,
    "pssEligible": false,
    "subscriptionEligible": false,
    "featured": true,
    "bestSeller": true,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.9,
    "reviewCount": 33
  },
  {
    "id": "sc-espresso-penny-loafers",
    "sku": "SC-SHOE-LOAF",
    "name": "Espresso Burnished Leather Penny Loafers",
    "categoryId": "shoes-sandals-slippers",
    "subcategory": "Men Loafers & Brogues",
    "description": "Blake-stitched calfskin dress loafers in deep espresso brown with breathable leather lining — tailored for Senator wear or formal suiting.",
    "priceNGN": 72000,
    "priceAUD": 128,
    "images": [
      "/assets/products/shoes_loafers.jpg"
    ],
    "unit": "Pair",
    "variants": [
      "EU 41 / AU 8",
      "EU 42 / AU 9",
      "EU 43 / AU 10",
      "EU 44 / AU 11"
    ],
    "stock": 20,
    "pssEligible": true,
    "pssMinDepositPercent": 35,
    "subscriptionEligible": false,
    "featured": false,
    "bestSeller": false,
    "markets": [
      "NG",
      "AU"
    ],
    "ratingAvg": 4.8,
    "reviewCount": 15
  }
];

export const INITIAL_SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'sub-pkg-weekly-essentials',
    name: 'Weekly Essentials Pantry Box',
    description: 'Scheduled every 7 days: Caprice 5 kg rice, Ijebu garri, Palm Oil 1.5 L, frozen chicken laps & fresh tomatoes.',
    image: "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms01_716e56ad-3161-4b89-b49f-a5bd27f5bc60.jpg?v=1763393172",
    frequencyOptions: ['weekly', 'biweekly'],
    priceNGN: 29500,
    priceAUD: 42.0,
    items: [
      'Caprice Parboiled Rice 5 kg',
      'Garri - Ijebu (Paint Bucket)',
      'Palm Oil 1.5 L',
      'Chicken Laps - Soft ~1 kg - Frozen',
      'Tomatoes 1 kg (Firm) & Onions 1 kg',
    ],
    active: true,
  },
  {
    id: 'sub-pkg-monthly-family-crate',
    name: 'Monthly Family Bulk Foodstuff Plan',
    description: 'Automated monthly household restock at 8% subscriber savings featuring Royal Stallion 50 kg, Oloyin beans, Power Oil & seasonings.',
    image: "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms08_e9f1d16c-38fb-434f-a54b-f4d34584d944.jpg?v=1763393493",
    frequencyOptions: ['monthly', 'biweekly'],
    priceNGN: 128000,
    priceAUD: 178.5,
    items: [
      'Royal Stallion Parboiled Rice 50 kg',
      'Beans - Oloyin (Paint Bucket)',
      'Golden Penny Semovita 5 kg & Garri 5 kg',
      'Palm Oil 5 L & Power Vegetable Oil 4.5 L',
      'Maggi Star x100, Egusi & Crayfish',
    ],
    active: true,
  },
  {
    id: 'sub-pkg-diaspora-parents-care',
    name: 'Diaspora Family Care Monthly Plan',
    description: 'Send verified monthly foodstuffs & beverages to family in Nigeria or stock your home in Australia automatically.',
    image: "https://cdn.shopify.com/s/files/1/0773/4037/7385/files/hmpxms06.jpg?v=1763393437",
    frequencyOptions: ['monthly'],
    priceNGN: 88000,
    priceAUD: 124.0,
    items: [
      'Royal Stallion Parboiled Rice 25 kg',
      'Nini Foods Honey Beans 2 kg & Garri 5 kg',
      'Okomu Banga Red Palm Oil 4 L',
      'Peak Milk 800 g & Milo 800 g Sachet',
      'Indomie Chicken 70 g x40 Carton',
    ],
    active: true,
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'SAMSARA10',
    discountType: 'percent',
    discountValue: 10,
    minSpendNGN: 30000,
    minSpendAUD: 50,
    active: true,
  },
  {
    code: 'PAYSMALL5',
    discountType: 'percent',
    discountValue: 5,
    minSpendNGN: 25000,
    minSpendAUD: 45,
    active: true,
  },
];
