export interface Seller {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  memberSince: string;
  rating: number;
  reviewCount: number;
  phone: string;
  whatsapp: string;
  location: string;
  responseRate: string;
  responseTime: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'GH₵' | 'USD' | 'KES' | 'SOS';
  originalPrice?: number;
  negotiable: boolean;
  category: string;
  categoryName: string;
  subcategory: string;
  condition: 'Brand New' | 'Like New' | 'Used - Good' | 'Refurbished';
  images: string[];
  location: {
    city: string;
    neighborhood: string;
  };
  seller: Seller;
  featured: boolean;
  isVerifiedDeal: boolean;
  createdAt: string;
  views: number;
  likes: number;
  deliveryAvailable: boolean;
  hasAudioDescription?: boolean;
  audioDescriptionDuration?: number;
  audioDescriptionUrl?: string;
  specifications: Record<string, string>;
  tags: string[];
  isSold?: boolean;
  status?: 'Active' | 'Sold';
  soldNotice?: string;
  quantity?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  color: string;
  bgLight: string;
  subcategories: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted';
  isSeller?: boolean;
}

export interface ChatConversation {
  id: string;
  listingId?: string;
  listingTitle: string;
  listingPrice: number;
  listingCurrency: string;
  listingImage: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    online: boolean;
    phone?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  type: 'price_drop' | 'message' | 'ad_approved' | 'offer' | 'safety';
  title: string;
  body: string;
  time: string;
  read: boolean;
  listingId?: string;
  imageUrl?: string;
  /** Where tapping the notification goes when it is not about an ad or a chat */
  target?: 'application' | 'dashboard';
}

// Categories, in the order shown on Home and the Categories page
export const CATEGORIES: Category[] = [
  {
    id: 'cat-vehicles',
    name: 'Vehicles',
    slug: 'vehicles',
    icon: 'CarFront',
    count: 5,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Cars for Sale', 'Motorcycles & Scooters', 'Commercial Vehicles', 'Car Parts & Accessories'],
  },
  {
    id: 'cat-property',
    name: 'Property',
    slug: 'property',
    icon: 'Home',
    count: 5,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Rooms for Rent', 'Apartments for Sale', 'Land & Plots', 'Commercial Property', 'Short Stays'],
  },
  {
    id: 'cat-phones',
    name: 'Phones & Tablets',
    slug: 'phones',
    icon: 'Smartphone',
    count: 6,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['iPhones', 'Samsung', 'Tablets & iPads', 'Smart Watches', 'Mobile Accessories'],
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    icon: 'Laptop',
    count: 7,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Laptops & MacBooks', 'TVs & Audio', 'Cameras', 'Video Games & PS5', 'Audio & Headphones'],
  },
  {
    id: 'cat-furniture',
    name: 'Home & Furniture',
    slug: 'furniture',
    icon: 'Sofa',
    count: 5,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Living Room Sets', 'Kitchen & Dining', 'Beds & Mattresses', 'Home Decor'],
  },
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt',
    count: 5,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ["Men's Wear", "Women's Clothing", 'Shoes & Sneakers', 'Watches & Jewelry', 'Bags & Accessories'],
  },
  {
    id: 'cat-appliances',
    name: 'Home Appliances',
    slug: 'appliances',
    icon: 'Refrigerator',
    count: 0,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Fridges & Freezers', 'Washing Machines', 'Cookers & Microwaves', 'Air Conditioners & Fans', 'Kitchen Appliances'],
  },
  {
    id: 'cat-livestock',
    name: 'Livestock',
    slug: 'livestock',
    icon: 'Beef',
    count: 0,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Cattle & Cows', 'Goats & Sheep', 'Poultry & Eggs', 'Pigs', 'Animal Feed & Vet Supplies'],
  },
  {
    id: 'cat-leisure',
    name: 'Leisure & Activities',
    slug: 'leisure',
    icon: 'Dumbbell',
    count: 4,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Sports & Fitness Equipment', 'Musical Instruments', 'Books & Stationery', 'Camping & Outdoors'],
  },
  {
    id: 'cat-tools',
    name: 'Tools & Building',
    slug: 'tools',
    icon: 'Wrench',
    count: 0,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Power Tools', 'Hand Tools', 'Building Materials', 'Generators', 'Plumbing & Electrical'],
  },
  {
    id: 'cat-kids',
    name: 'Babies & Kids',
    slug: 'kids',
    icon: 'Baby',
    count: 4,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Baby Clothing', 'Strollers & Car Seats', 'Toys & Board Games', 'Baby Nursery & Cots'],
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty',
    icon: 'HeartPulse',
    count: 4,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Skincare & Treatments', 'Hair & Wigs', 'Fragrances & Perfumes', 'Makeup', 'Personal Grooming'],
  },
  {
    id: 'cat-agriculture',
    name: 'Food, Agriculture & Farming',
    slug: 'agriculture',
    icon: 'Wheat',
    count: 4,
    color: '#0F172A',
    bgLight: '#E8EDF2',
    subcategories: ['Fresh Farm Produce', 'Grains & Rice Bags', 'Farm Machinery & Irrigation', 'Poultry & Livestock'],
  },
];

export interface GhanaRegion {
  id: string;
  name: string;
  capital: string;
}

export const GHANA_16_REGIONS: GhanaRegion[] = [
  { id: 'Greater Accra', name: 'Greater Accra', capital: 'Accra' },
  { id: 'Ashanti', name: 'Ashanti', capital: 'Kumasi' },
  { id: 'Western', name: 'Western', capital: 'Sekondi-Takoradi' },
  { id: 'Western North', name: 'Western North', capital: 'Sefwi Wiawso' },
  { id: 'Central', name: 'Central', capital: 'Cape Coast' },
  { id: 'Eastern', name: 'Eastern', capital: 'Koforidua' },
  { id: 'Volta', name: 'Volta', capital: 'Ho' },
  { id: 'Oti', name: 'Oti', capital: 'Dambai' },
  { id: 'Northern', name: 'Northern', capital: 'Tamale' },
  { id: 'Savannah', name: 'Savannah', capital: 'Damongo' },
  { id: 'North East', name: 'North East', capital: 'Nalerigu' },
  { id: 'Upper East', name: 'Upper East', capital: 'Bolgatanga' },
  { id: 'Upper West', name: 'Upper West', capital: 'Wa' },
  { id: 'Bono', name: 'Bono', capital: 'Sunyani' },
  { id: 'Bono East', name: 'Bono East', capital: 'Techiman' },
  { id: 'Ahafo', name: 'Ahafo', capital: 'Goaso' },
];

export const POPULAR_GHANA_TOWNS: Record<string, string[]> = {
  'Greater Accra': ['Accra Central', 'Tema', 'East Legon', 'Spintex', 'Madina', 'Osu', 'Dansoman', 'Achimota', 'Adenta', 'Cantonments', 'Kaneshie', 'Lapaz', 'Dome'],
  'Ashanti': ['Kumasi Central', 'Bantama', 'Adum', 'Asokwa', 'Ahodwo', 'Obuasi', 'Ejisu', 'Mampong', 'Suame', 'Tafo', 'Konongo'],
  'Western': ['Sekondi-Takoradi', 'Tarkwa', 'Kwesimintsim', 'Effia', 'Anaji', 'Axim', 'Elubo', 'Prestea'],
  'Western North': ['Sefwi Wiawso', 'Bibiani', 'Juaboso', 'Enchi', 'Bodi'],
  'Central': ['Cape Coast', 'Kasoa', 'Winneba', 'Mankessim', 'Elmina', 'Swedru', 'Budumburam', 'Saltpond'],
  'Eastern': ['Koforidua', 'Nkawkaw', 'Nsawam', 'Akosombo', 'Suhum', 'Asamankese', 'Somanya', 'Aburi'],
  'Volta': ['Ho', 'Hohoe', 'Aflao', 'Kpando', 'Anloga', 'Sogakope', 'Keta', 'Dzodze'],
  'Oti': ['Dambai', 'Nkwanta', 'Jasikan', 'Kadjebi', 'Kete Krachi'],
  'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla', 'Kpandai'],
  'Savannah': ['Damongo', 'Salaga', 'Bole', 'Sawla', 'Buipe'],
  'North East': ['Nalerigu', 'Walewale', 'Gambaga', 'Bunkpurugu', 'Chereponi'],
  'Upper East': ['Bolgatanga', 'Bawku', 'Navrongo', 'Paga', 'Zebilla'],
  'Upper West': ['Wa', 'Jirapa', 'Lawra', 'Nandom', 'Tumu'],
  'Bono': ['Sunyani', 'Berekum', 'Dormaa Ahenkro', 'Wenchi', 'Sampa'],
  'Bono East': ['Techiman', 'Kintampo', 'Atebubu', 'Nkoranza', 'Yeji', 'Prang'],
  'Ahafo': ['Goaso', 'Mim', 'Kenyasi', 'Bechem', 'Duayaw Nkwanta'],
};

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

/** Trades in rows of four; each slug is an artisan directory category, so a tile shows only that trade. */
export const SERVICES_CATEGORIES: ServiceCategory[] = [
  { id: 'srv-1', name: 'Carpentry', slug: 'carpenters', icon: 'Hammer', count: 0 },
  { id: 'srv-2', name: 'Electrical & Solar', slug: 'electricians', icon: 'Zap', count: 0 },
  { id: 'srv-3', name: 'Plumbing', slug: 'plumbers', icon: 'Wrench', count: 0 },
  { id: 'srv-4', name: 'AC & Fridge Repair', slug: 'ac-repair', icon: 'Snowflake', count: 0 },
  { id: 'srv-5', name: 'Masonry & Tiling', slug: 'masons', icon: 'BrickWall', count: 0 },
  { id: 'srv-6', name: 'Painting', slug: 'painters', icon: 'PaintRoller', count: 0 },
  { id: 'srv-7', name: 'Auto Mechanic', slug: 'mechanics', icon: 'Car', count: 0 },
  { id: 'srv-8', name: 'Welding', slug: 'welders', icon: 'Flame', count: 0 },
  { id: 'srv-9', name: 'Jobs', slug: 'jobs', icon: 'Briefcase', count: 0 },
  { id: 'srv-10', name: 'Art & Crafts', slug: 'art-crafts', icon: 'Palette', count: 0 },
  { id: 'srv-11', name: 'Photography', slug: 'photography', icon: 'Camera', count: 0 },
  { id: 'srv-12', name: 'Catering & Food', slug: 'catering', icon: 'UtensilsCrossed', count: 0 },
];

export interface ArtisanItem {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  jobsCompleted: number;
  rate: string;
  avatar: string;
  verified: boolean;
  category:
    | 'carpenters' | 'electricians' | 'plumbers' | 'ac-repair' | 'masons' | 'painters' | 'mechanics' | 'welders'
    | 'jobs' | 'art-crafts' | 'photography' | 'tailoring' | 'catering' | 'electronics' | 'other';
  badges: string[];
  audioIntro?: string;
  portfolioCount?: number;
  phone: string;
}

export const FEATURED_ARTISANS: ArtisanItem[] = [];

export const ARTISANS_DIRECTORY: ArtisanItem[] = [];

export const INITIAL_LISTINGS: Listing[] = [];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
