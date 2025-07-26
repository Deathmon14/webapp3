/**
 * USER DATA
 */
export const users = [
  { uid: 'client01', name: 'Aisha Khan', email: 'aisha@example.com', role: 'client', status: 'active' },
  { uid: 'client02', name: 'Ben Carter', email: 'ben@example.com', role: 'client', status: 'active' },
  { uid: 'vendor01', name: 'Eternity Photography', email: 'contact@eternityphoto.com', role: 'vendor', status: 'active' },
  { uid: 'vendor02', name: 'Gourmet Catering Co.', email: 'orders@gourmetco.com', role: 'vendor', status: 'active' },
  { uid: 'vendor03', name: 'Prestige Venues', email: 'bookings@prestigevenues.com', role: 'vendor', status: 'active' },
  { uid: 'admin01', name: 'Admin User', email: 'admin@eventease.com', role: 'admin', status: 'active' }
];

/**
 * EVENT PACKAGES
 */
export const eventPackages = [
  {
    id: 'pkg_wedding_rustic',
    name: 'Rustic Barn Wedding',
    description: 'A charming and elegant countryside wedding experience with natural decor and a cozy ambiance.',
    basePrice: 7500,
    image: 'https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg',
    features: ['Full-day barn venue rental', 'String lighting & lanterns', 'Wooden tables & chairs', 'Ceremony arch'],
    popular: true
  },
  {
    id: 'pkg_corp_techconf',
    name: 'Innovate Tech Conference',
    description: 'A complete package for a professional and engaging tech conference or summit.',
    basePrice: 12000,
    image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
    features: ['Main stage with AV setup', 'Multiple breakout rooms', 'High-speed Wi-Fi', 'Registration desk & staffing']
  },
  {
    id: 'pkg_social_gala',
    name: 'Elegant Gala Dinner',
    description: 'Host a sophisticated evening for fundraising, awards, or celebration with our all-inclusive gala package.',
    basePrice: 9800,
    image: 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg',
    features: ['Ballroom venue rental', 'Round table setup with linens', 'Ambient uplighting', 'Three-course plated dinner'],
    popular: true
  },
  {
    id: 'pkg_birthday_scifi',
    name: 'Kids\' Sci-Fi Adventure',
    description: 'An out-of-this-world birthday party with futuristic decorations and interactive entertainment.',
    basePrice: 2500,
    image: 'https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg',
    features: ['Themed decorations (planets, stars)', 'LED lighting effects', 'Kids-friendly menu', 'Interactive science show']
  },
   {
    id: 'pkg_corp_product_launch',
    name: 'Dynamic Product Launch',
    description: 'Create a buzz with a high-impact launch event designed to impress media and clients.',
    basePrice: 8500,
    image: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg',
    features: ['Modern industrial venue', 'Professional sound system', 'Product display stands', 'Networking cocktail hour']
  },
  {
    id: 'pkg_wedding_beach',
    name: 'Seaside Serenity Wedding',
    description: 'A breathtaking beach ceremony followed by a chic and relaxed reception.',
    basePrice: 9200,
    image: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
    features: ['Private beach ceremony permit', 'Bamboo wedding arch (chuppah)', 'Seating for up to 100 guests', 'Sunset reception setup'],
    popular: true
  }
];

/**
 * CUSTOMIZATION OPTIONS
 */
export const customizationOptions = [
  // --- VENUE ---
  {
    id: 'venue_barn_countryside',
    category: 'venue',
    name: 'Countryside Barn',
    price: 3000,
    description: 'Spacious, authentic barn with modern amenities and scenic views.',
    image: 'https://images.pexels.com/photos/2422467/pexels-photo-2422467.jpeg'
  },
  {
    id: 'venue_hotel_ballroom',
    category: 'venue',
    name: 'Grand Hotel Ballroom',
    price: 4500,
    description: 'Luxurious and classic ballroom with crystal chandeliers for a formal affair.',
    image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg'
  },
  {
    id: 'venue_rooftop_lounge',
    category: 'venue',
    name: 'Rooftop City Lounge',
    price: 3800,
    description: 'Modern, open-air rooftop with stunning city skyline views.',
    image: 'https://images.pexels.com/photos/2263410/pexels-photo-2263410.jpeg'
  },
  {
    id: 'venue_beachfront_resort',
    category: 'venue',
    name: 'Beachfront Resort Deck',
    price: 4200,
    description: 'Private deck overlooking the ocean, perfect for ceremonies and receptions.',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg'
  },
  
  // --- CATERING ---
  {
    id: 'catering_plated_3course',
    category: 'catering',
    name: 'Three-Course Plated Dinner',
    price: 85,
    description: 'Elegant, seated dinner service with choice of entree. (Price per person)',
    image: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg'
  },
  {
    id: 'catering_food_truck_fest',
    category: 'catering',
    name: 'Gourmet Food Truck Festival',
    price: 60,
    description: 'A fun, casual experience with a selection of 3 gourmet food trucks. (Price per person)',
    image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg'
  },
  {
    id: 'catering_vegan_delight',
    category: 'catering',
    name: 'Artisanal Vegan Buffet',
    price: 75,
    description: 'A high-end, plant-based buffet with creative and delicious options. (Price per person)',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg'
  },
  
  // --- DECORATION ---
  {
    id: 'decor_classic_floral',
    category: 'decoration',
    name: 'Classic Floral & Greenery',
    price: 1500,
    description: 'Timeless arrangements of roses, eucalyptus, and seasonal flowers.',
    image: 'https://images.pexels.com/photos/2253832/pexels-photo-2253832.jpeg'
  },
  {
    id: 'decor_modern_minimalist',
    category: 'decoration',
    name: 'Modern Minimalist',
    price: 1200,
    description: 'Clean lines, geometric shapes, and a monochromatic color scheme.',
    image: 'https://images.pexels.com/photos/1400349/pexels-photo-1400349.jpeg'
  },
  {
    id: 'decor_tech_interactive',
    category: 'decoration',
    name: 'High-Tech Interactive Lights',
    price: 2200,
    description: 'Programmable LED walls, projection mapping, and interactive light installations.',
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'
  },

  // --- ENTERTAINMENT ---
  {
    id: 'ent_live_jazz_trio',
    category: 'entertainment',
    name: 'Live Jazz Trio',
    price: 1800,
    description: 'Sophisticated background music for cocktail hours and dinners (3-hour set).',
    image: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg'
  },
  {
    id: 'ent_dj_lightshow',
    category: 'entertainment',
    name: 'DJ with Full Lightshow',
    price: 2500,
    description: 'Professional DJ, premium sound system, and dynamic lighting for a high-energy party.',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'
  },
  {
    id: 'ent_magic_illusion',
    category: 'entertainment',
    name: 'Close-Up Magician',
    price: 1200,
    description: 'A strolling magician to entertain guests during the reception (2 hours).',
    image: 'https://images.pexels.com/photos/4353618/pexels-photo-4353618.jpeg'
  },

  // --- PHOTOGRAPHY ---
  {
    id: 'photo_full_day_video',
    category: 'photography',
    name: 'Full Day Photo & Cinema',
    price: 5500,
    description: '8 hours of photography coverage plus a 5-minute cinematic highlight film.',
    image: 'https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg'
  },
  {
    id: 'photo_drone_coverage',
    category: 'photography',
    name: 'Drone Coverage Add-on',
    price: 800,
    description: 'Breathtaking aerial shots of your venue and event (weather permitting).',
    image: 'https://images.pexels.com/photos/3314953/pexels-photo-3314953.jpeg'
  },
   {
    id: 'photo_journalistic',
    category: 'photography',
    name: 'Photojournalistic Coverage',
    price: 3500,
    description: 'Candid, story-telling style photography for 6 hours.',
    image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg'
  }
];

/**
 * DYNAMIC DATA (Intentionally empty)
 */
export const bookingRequests = [];
export const vendorTasks = [];