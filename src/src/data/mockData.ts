import { User, EventPackage, CustomizationOption, BookingRequest, VendorTask } from '../types';

export const users: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'client' },
  { id: '2', name: 'Mike Chen', email: 'mike@example.com', role: 'client' },
  { id: '3', name: 'Emma Photography', email: 'emma@photo.com', role: 'vendor' },
  { id: '4', name: 'David Catering Co.', email: 'david@catering.com', role: 'vendor' },
  { id: '5', name: 'Admin User', email: 'admin@eventhease.com', role: 'admin' }
];

export const eventPackages: EventPackage[] = [
  {
    id: '1',
    name: 'Elegant Wedding',
    description: 'Perfect for intimate wedding celebrations with sophisticated touches',
    basePrice: 2500,
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
    features: ['Floral arrangements', 'Basic lighting', 'Table settings', 'Ceremony setup'],
    popular: true
  },
  {
    id: '2',
    name: 'Corporate Event',
    description: 'Professional setups ideal for business conferences and meetings',
    basePrice: 1800,
    image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg',
    features: ['AV equipment', 'Professional staging', 'Networking area', 'Welcome reception']
  },
  {
    id: '3',
    name: 'Birthday Celebration',
    description: 'Fun and vibrant package for memorable birthday parties',
    basePrice: 1200,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    features: ['Theme decorations', 'Entertainment setup', 'Cake table', 'Party favors']
  },
  {
    id: '4',
    name: 'Garden Party',
    description: 'Outdoor elegance with natural beauty and fresh air',
    basePrice: 2000,
    image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg',
    features: ['Outdoor lighting', 'Garden decorations', 'Weather protection', 'Natural styling']
  }
];

export const customizationOptions: CustomizationOption[] = [
  // Venue
  {
    id: 'v1',
    category: 'venue',
    name: 'Grand Ballroom',
    price: 800,
    description: 'Elegant ballroom with crystal chandeliers',
    image: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg'
  },
  {
    id: 'v2',
    category: 'venue',
    name: 'Garden Pavilion',
    price: 600,
    description: 'Beautiful outdoor pavilion surrounded by gardens',
    image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg'
  },
  {
    id: 'v3',
    category: 'venue',
    name: 'Rooftop Terrace',
    price: 700,
    description: 'Modern rooftop with city skyline views',
    image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg'
  },
  
  // Catering
  {
    id: 'c1',
    category: 'catering',
    name: 'Premium Buffet',
    price: 45,
    description: 'Gourmet buffet with international cuisine (per person)',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg'
  },
  {
    id: 'c2',
    category: 'catering',
    name: 'Plated Dinner',
    price: 65,
    description: 'Three-course plated dinner service (per person)',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'
  },
  {
    id: 'c3',
    category: 'catering',
    name: 'Cocktail Reception',
    price: 35,
    description: 'Appetizers and cocktail service (per person)',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg'
  },
  
  // Decoration
  {
    id: 'd1',
    category: 'decoration',
    name: 'Luxury Florals',
    price: 500,
    description: 'Premium flower arrangements and centerpieces',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'
  },
  {
    id: 'd2',
    category: 'decoration',
    name: 'LED Lighting',
    price: 300,
    description: 'Ambient LED lighting system with color options',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'
  },
  {
    id: 'd3',
    category: 'decoration',
    name: 'Themed Decor',
    price: 400,
    description: 'Custom themed decorations and props',
    image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg'
  },
  
  // Entertainment
  {
    id: 'e1',
    category: 'entertainment',
    name: 'Live Band',
    price: 800,
    description: 'Professional 4-piece band for 4 hours',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
  },
  {
    id: 'e2',
    category: 'entertainment',
    name: 'DJ Service',
    price: 400,
    description: 'Professional DJ with sound system and lighting',
    image: 'https://images.pexels.com/photos/154147/pexels-photo-154147.jpeg'
  },
  {
    id: 'e3',
    category: 'entertainment',
    name: 'Photo Booth',
    price: 300,
    description: 'Interactive photo booth with props and printing',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'
  },
  
  // Photography
  {
    id: 'p1',
    category: 'photography',
    name: 'Professional Package',
    price: 1200,
    description: 'Full event coverage with edited photos (8 hours)',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'
  },
  {
    id: 'p2',
    category: 'photography',
    name: 'Basic Coverage',
    price: 600,
    description: 'Essential moments coverage (4 hours)',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'
  },
  {
    id: 'p3',
    category: 'photography',
    name: 'Video Package',
    price: 1500,
    description: 'Videography with highlight reel and full ceremony',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'
  }
];

export const bookingRequests: BookingRequest[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Sarah Johnson',
    packageId: '1',
    packageName: 'Elegant Wedding',
    customizations: [
      customizationOptions.find(o => o.id === 'v1')!,
      customizationOptions.find(o => o.id === 'c2')!,
      customizationOptions.find(o => o.id === 'd1')!,
      customizationOptions.find(o => o.id === 'p1')!
    ],
    totalPrice: 5500,
    eventDate: '2024-06-15',
    status: 'confirmed',
    createdAt: '2024-01-15',
    requirements: 'Allergies: nuts, dairy-free options needed for 3 guests. Preferred colors: blush pink and gold.'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Mike Chen',
    packageId: '2',
    packageName: 'Corporate Event',
    customizations: [
      customizationOptions.find(o => o.id === 'v3')!,
      customizationOptions.find(o => o.id === 'c3')!,
      customizationOptions.find(o => o.id === 'e2')!
    ],
    totalPrice: 3900,
    eventDate: '2024-05-20',
    status: 'pending',
    createdAt: '2024-01-20',
    requirements: 'Need AV setup for presentations, 50 attendees expected, vegetarian options preferred.'
  }
];

export const vendorTasks: VendorTask[] = [
  {
    id: '1',
    bookingId: '1',
    vendorId: '3',
    category: 'photography',
    title: 'Wedding Photography - Sarah Johnson',
    description: 'Professional wedding photography package with 8-hour coverage',
    status: 'in-progress',
    deadline: '2024-06-15',
    clientRequirements: 'Preferred colors: blush pink and gold. Special request for family group photos.',
    eventDate: '2024-06-15'
  },
  {
    id: '2',
    bookingId: '1',
    vendorId: '4',
    category: 'catering',
    title: 'Wedding Catering - Sarah Johnson',
    description: 'Three-course plated dinner service for wedding reception',
    status: 'assigned',
    deadline: '2024-06-15',
    clientRequirements: 'Allergies: nuts, dairy-free options needed for 3 guests.',
    eventDate: '2024-06-15'
  },
  {
    id: '3',
    bookingId: '2',
    vendorId: '4',
    category: 'catering',
    title: 'Corporate Event Catering - Mike Chen',
    description: 'Cocktail reception catering for corporate event',
    status: 'assigned',
    deadline: '2024-05-20',
    clientRequirements: '50 attendees expected, vegetarian options preferred.',
    eventDate: '2024-05-20'
  }
];