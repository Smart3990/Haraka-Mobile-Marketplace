import React from 'react';
import {
  Smartphone,
  Zap,
  Laptop,
  Cog,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  Calendar,
  SlidersHorizontal,
  Layers,
  Palette,
  Home,
  Shirt,
  Briefcase,
  Armchair,
  DoorClosed,
  Hammer,
} from 'lucide-react';
import { ArtisanItem } from './listingData';

export interface ArtisanProfileDetails {
  subrole: string;
  voiceLang: string;
  languages: string;
  guaranteeLocation: string;
  services: Array<{
    title: string;
    desc: string;
    price: string;
    icon: React.ReactNode;
  }>;
  portfolio: Array<{
    title: string;
    tag: string;
    sub: string;
    img: string;
  }>;
  reviews: Array<{
    initials: string;
    bg: string;
    name: string;
    loc: string;
    text: string;
    time: string;
  }>;
  calloutLabel: string;
  calloutPrice: string;
  arrivalNote: string;
}

export const getArtisanProfileData = (art: ArtisanItem): ArtisanProfileDetails => {
  // 1. Phone & Electronics Repair (Kwame Electronics)
  if (
    art.id === 'artisan-kwame-tech' ||
    (art.category === 'electronics' && !art.role.toLowerCase().includes('solar'))
  ) {
    return {
      subrole: 'Certified Smartphone, Tablet & Laptop Technician',
      voiceLang: 'English & Twi',
      languages: 'Speaks: English, Twi, Ga',
      guaranteeLocation: 'Circle (Tip Toe Lane) & Central Accra',
      services: [
        {
          title: 'Screen & OLED Display Replacement',
          desc: 'Genuine iPhone, Samsung & AMOLED displays',
          price: 'From GH₵ 180',
          icon: <Smartphone size={18} />,
        },
        {
          title: 'Battery Replacement & Calibration',
          desc: 'Original high-capacity cell overhaul',
          price: 'From GH₵ 120',
          icon: <Zap size={18} />,
        },
        {
          title: 'Logic Board & Water Damage Repair',
          desc: 'Component level micro-soldering & IC fix',
          price: 'From GH₵ 250',
          icon: <Laptop size={18} />,
        },
        {
          title: 'Charging Port & Audio IC Fix',
          desc: 'Same-day rapid repair with warranty',
          price: 'From GH₵ 90',
          icon: <Cog size={18} className="text-black" />,
        },
      ],
      portfolio: [
        {
          title: 'iPhone 14 Pro OLED Fix',
          tag: 'Display',
          sub: 'Circle • True Tone Restored',
          img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'MacBook Air Logic Board',
          tag: 'Laptop',
          sub: 'Osu • Ultrasonic Cleaned',
          img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Samsung S23 Ultra Screen',
          tag: 'Curved Glass',
          sub: 'Airport • Genuine AMOLED',
          img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'iPad Pro Battery Swap',
          tag: 'Tablet',
          sub: 'Dzorwulu • 100% Health',
          img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'HP Envy Hinge Repair',
          tag: 'Hardware',
          sub: 'Adabraka • Steel Re-bracket',
          img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Type-C Port Micro-solder',
          tag: 'Soldering',
          sub: 'Tip Toe • Fast Charge Restored',
          img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Dell XPS Fan & Paste',
          tag: 'Thermal',
          sub: 'Ridge • Arctic MX-4',
          img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Speaker & Earpiece Flush',
          tag: 'Audio',
          sub: 'Circle • Debris Extracted',
          img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=80',
        },
      ],
      reviews: [
        {
          initials: 'PB',
          bg: 'bg-emerald-100 text-emerald-800',
          name: 'Prince Boateng',
          loc: 'Circle, Accra',
          text: 'Kwame replaced my iPhone 13 Pro display in under 35 minutes. True Tone and Face ID were preserved completely.',
          time: 'Yesterday',
        },
        {
          initials: 'FD',
          bg: 'bg-amber-100 text-amber-800',
          name: 'Francisca Doe',
          loc: 'Adabraka, Accra',
          text: 'Diagnosed water damage on my MacBook Air when another shop said it was dead. Got all my student files back safely.',
          time: '1 week ago',
        },
      ],
      calloutLabel: 'Inspection & Diagnostic Check',
      calloutPrice: 'FREE',
      arrivalNote: 'Upon arrival',
    };
  }

  // 2. Catering & Event Cooking (Esi Catering Co.)
  if (art.category === 'catering' || art.name.toLowerCase().includes('esi')) {
    return {
      subrole: 'Executive Ghanaian & Continental Event Caterer',
      voiceLang: 'English, Twi & Fante',
      languages: 'Speaks: English, Twi, Fante',
      guaranteeLocation: 'East Legon & Greater Accra',
      services: [
        {
          title: 'Wedding & Celebration Buffets',
          desc: 'Jollof, fried rice, grilled meats & salads',
          price: 'From GH₵ 65 / plate',
          icon: <UtensilsCrossed size={18} />,
        },
        {
          title: 'Executive Corporate Lunch Packs',
          desc: 'Delivered warm to offices across Accra',
          price: 'From GH₵ 35 / pack',
          icon: <ShoppingBag size={18} />,
        },
        {
          title: 'Private Chef Dining Experience',
          desc: 'Exclusive multi-course dinners at your home',
          price: 'From GH₵ 350 / session',
          icon: <Sparkles size={18} />,
        },
        {
          title: 'Cocktail Canapés & Small Chops',
          desc: 'Kelewele skewers, spring rolls & finger foods',
          price: 'From GH₵ 45 / person',
          icon: <Calendar size={18} />,
        },
      ],
      portfolio: [
        {
          title: 'Banquet Jollof & Grill Setup',
          tag: 'Buffet',
          sub: 'East Legon • 150 Guests',
          img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Luxury Canape Table',
          tag: 'Cocktail',
          sub: 'Labone • Corporate Mixer',
          img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Grilled Tilapia & Banku Spread',
          tag: 'Traditional',
          sub: 'Cantonments • Fresh Herbs',
          img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Gourmet Boxed Executive Lunches',
          tag: 'Corporate',
          sub: 'Airport City • Sealed & Hot',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Dessert & Fruit Display',
          tag: 'Dessert',
          sub: 'Ridge • Tropical Blend',
          img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Outdoor Live BBQ Station',
          tag: 'Live Station',
          sub: 'Trassaco • Charcoal Smoked',
          img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Seafood Coconut Curry',
          tag: 'Specialty',
          sub: 'Osu • Wild Prawns',
          img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Traditional Wedding Chafing Setup',
          tag: 'Ceremony',
          sub: 'Tema • Gold Chafers',
          img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
        },
      ],
      reviews: [
        {
          initials: 'NY',
          bg: 'bg-emerald-100 text-emerald-800',
          name: 'Nana Yaa Poku',
          loc: 'East Legon, Accra',
          text: 'Esi catered our 150-guest anniversary. The firewood party jollof and spicy grilled goat were the absolute highlight.',
          time: '3 days ago',
        },
        {
          initials: 'KA',
          bg: 'bg-amber-100 text-amber-800',
          name: 'Kofi Annan-Prah',
          loc: 'Airport City, Accra',
          text: 'Ordered 50 executive corporate lunch boxes for our quarterly board meeting. Delivered hot right on time.',
          time: '2 weeks ago',
        },
      ],
      calloutLabel: 'Menu Tasting & Consultation',
      calloutPrice: 'GH₵ 100',
      arrivalNote: 'Upon booking',
    };
  }

  // 3. Solar & Electrical (Kwame Tech)
  if (
    art.category === 'electricians' ||
    art.role.toLowerCase().includes('solar') ||
    art.role.toLowerCase().includes('wireman')
  ) {
    return {
      subrole: 'Certified Solar Wireman & Energy Specialist',
      voiceLang: 'English & Twi',
      languages: 'Speaks: English, Twi, Ga',
      guaranteeLocation: 'East Legon, Madina & Accra',
      services: [
        {
          title: 'Solar Inverter & Panel Setup',
          desc: 'Hybrid & off-grid 5kVA - 15kVA installs',
          price: 'From GH₵ 1,200',
          icon: <Zap size={18} />,
        },
        {
          title: 'Full House Conduit Wiring',
          desc: 'Certified distribution board & 3-phase',
          price: 'From GH₵ 800',
          icon: <Hammer size={18} />,
        },
        {
          title: 'Fault Tracing & Breaker Fix',
          desc: 'Rapid surge, earthing & short circuit fix',
          price: 'From GH₵ 150',
          icon: <SlidersHorizontal size={18} />,
        },
        {
          title: 'CCTV & Backup Battery Bank',
          desc: 'Lithium battery backup & surveillance rigging',
          price: 'From GH₵ 450',
          icon: <Laptop size={18} />,
        },
      ],
      portfolio: [
        {
          title: '10kVA Solar Roof Array',
          tag: 'Solar',
          sub: 'East Legon • 16 Panels',
          img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Industrial Distribution Board',
          tag: 'Wiring',
          sub: 'Spintex • Certified 3-Phase',
          img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Lithium Backup System',
          tag: 'Storage',
          sub: 'Madina • 10kWh LiFePO4',
          img: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Modern LED Recessed Lighting',
          tag: 'Lighting',
          sub: 'Airport Res • Smart Home',
          img: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Surge Protection Interlock',
          tag: 'Safety',
          sub: 'Dzorwulu • Lightning Arrestor',
          img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Solar Water Heater Rig',
          tag: 'Thermal',
          sub: 'Cantonments • 300L Pressure Tank',
          img: 'https://images.unsplash.com/photo-1548611716-ad888c3a9e3f?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Automatic Transfer Switch (ATS)',
          tag: 'Automation',
          sub: 'Labone • Dual Power Gen Sync',
          img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'IP CCTV 8-Camera Array',
          tag: 'Security',
          sub: 'Adjiringanor • Night Vision 4K',
          img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80',
        },
      ],
      reviews: [
        {
          initials: 'KM',
          bg: 'bg-emerald-100 text-emerald-800',
          name: 'Kojo Mensah-Bonsu',
          loc: 'East Legon, Accra',
          text: 'Kwame converted our home to 10kVA solar. Power hasn’t flickered once during load-shedding. Super punctual and tidy work!',
          time: '2 days ago',
        },
        {
          initials: 'GA',
          bg: 'bg-amber-100 text-amber-800',
          name: 'Grace Addo',
          loc: 'Madina, Accra',
          text: 'Diagnosed a difficult tripping fault in our kitchen circuits within 30 minutes. Very honest and polite professional.',
          time: '1 week ago',
        },
      ],
      calloutLabel: 'Inspection & Diagnostics',
      calloutPrice: 'FREE',
      arrivalNote: 'With booked work',
    };
  }

  // 4. Painting & Screeding (Ama Serwaa)
  if (
    art.category === 'painters' ||
    art.name.toLowerCase().includes('serwaa') ||
    art.role.toLowerCase().includes('painting') ||
    art.role.toLowerCase().includes('screeding')
  ) {
    return {
      subrole: 'Interior Wall Screeding, POP & Luxury Finishes',
      voiceLang: 'Twi, English & Fante',
      languages: 'Speaks: English, Twi, Fante',
      guaranteeLocation: 'Tema & Accra metropolis',
      services: [
        {
          title: 'Full House Putty Screeding',
          desc: 'Smooth POP putty skimming & primer seal',
          price: 'From GH₵ 25 / m²',
          icon: <Layers size={18} />,
        },
        {
          title: 'Italian Velvet Texture & Stucco',
          desc: 'Luxury marble finish & Venetian plaster',
          price: 'From GH₵ 45 / m²',
          icon: <Palette size={18} />,
        },
        {
          title: 'Exterior Weatherproof Shield',
          desc: 'Mould-resistant anti-fungal exterior painting',
          price: 'From GH₵ 35 / m²',
          icon: <Home size={18} />,
        },
        {
          title: 'POP Cornice & Moulding Repair',
          desc: 'Crown moulding patching & crack sealing',
          price: 'From GH₵ 180',
          icon: <Cog size={18} className="text-black" />,
        },
      ],
      portfolio: [
        {
          title: 'Velvet Matte Living Room',
          tag: 'Living Room',
          sub: 'Tema C25 • Silk Acrylic',
          img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'POP Decorative Ceiling',
          tag: 'Ceiling',
          sub: 'Sakumono • Screeded',
          img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Modern Accent Wall',
          tag: 'Feature Wall',
          sub: 'Adjiringanor • Geometric 3D',
          img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Exterior Villa Weathercoat',
          tag: 'Exterior',
          sub: 'East Legon Hills • Anti-UV',
          img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Hallway Venetian Stucco',
          tag: 'Italian Stucco',
          sub: 'Cantonments • High Gloss Wax',
          img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Master Bedroom Neutral Tone',
          tag: 'Bedroom',
          sub: 'Airport Hills • Warm Linen',
          img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Epoxy Seamless Floor Coating',
          tag: 'Epoxy',
          sub: 'Spintex • Metallic Marble',
          img: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Perimeter Wall Anti-Damp Paint',
          tag: 'Fence Wall',
          sub: 'Tema • Moisture-Locked',
          img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
        },
      ],
      reviews: [
        {
          initials: 'EQ',
          bg: 'bg-emerald-100 text-emerald-800',
          name: 'Dr. Evelyn Quaye',
          loc: 'Tema Community 25',
          text: 'Ama and her female crew screeded all 4 bedrooms and our living hall. Zero brush marks, perfectly smooth like glass! Highly recommended.',
          time: '4 days ago',
        },
        {
          initials: 'BO',
          bg: 'bg-amber-100 text-amber-800',
          name: 'Bernard Ofori',
          loc: 'Sakumono, Accra',
          text: 'Cleanest painting team in Accra. They masked all our floor tiles and furniture before opening a single paint can. Excellent finishing.',
          time: '3 weeks ago',
        },
      ],
      calloutLabel: 'Site Measurement & Estimate',
      calloutPrice: 'GH₵ 80',
      arrivalNote: 'Upon arrival',
    };
  }

  // 5. Tailoring (Ama's Tailoring)
  if (art.category === 'tailoring' || art.role.toLowerCase().includes('fashion')) {
    return {
      subrole: 'Bespoke African Wear & Modern Couturier',
      voiceLang: 'English & Twi',
      languages: 'Speaks: English, Twi, Ga',
      guaranteeLocation: 'Osu & Accra metropolis',
      services: [
        {
          title: 'Custom Kente & Kaftan Design',
          desc: 'Handwoven bespoke outfits & embroidery',
          price: 'From GH₵ 180',
          icon: <Shirt size={18} />,
        },
        {
          title: 'Bridal & Evening Gown Stitching',
          desc: 'Luxury custom evening silhouettes',
          price: 'From GH₵ 450',
          icon: <Palette size={18} />,
        },
        {
          title: 'Express 24h Alterations',
          desc: 'Same-day resizing, hemming & restyling',
          price: 'From GH₵ 60',
          icon: <Cog size={18} className="text-black" />,
        },
        {
          title: 'Corporate & Bulk Uniforms',
          desc: 'Tailored formal office wear & staff attires',
          price: 'From GH₵ 90 / set',
          icon: <Briefcase size={18} />,
        },
      ],
      portfolio: [
        {
          title: 'Ceremonial Kente Gown',
          tag: 'Kente',
          sub: 'Osu • Custom Cut',
          img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Linen Senator Kaftan',
          tag: 'Kaftan',
          sub: 'Cantonments • Pure Linen',
          img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Silk Evening Silhouette',
          tag: 'Gown',
          sub: 'Labone • Silk Satin',
          img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Corporate Blazer Suit',
          tag: 'Suiting',
          sub: 'Ridge • Fitted Wool',
          img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Traditional Agbada Ensemble',
          tag: 'Agbada',
          sub: 'East Legon • Hand Embroidered',
          img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Modern Peplum Top & Pencil Skirt',
          tag: 'African Print',
          sub: 'Osu • Vlisco Wax Block',
          img: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Bridesmaid Silk Maxi Sets',
          tag: 'Bridal',
          sub: 'Airport Res • Rose Gold Silk',
          img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Men Casual Dashiki Shirt',
          tag: 'Dashiki',
          sub: 'Labone • Pure Cotton',
          img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80',
        },
      ],
      reviews: [
        {
          initials: 'SA',
          bg: 'bg-emerald-100 text-emerald-800',
          name: 'Sandra Appiah',
          loc: 'Osu, Accra',
          text: 'Ama crafted my traditional wedding gown. The stitching was immaculate and fit like a glove without a single adjustment needed!',
          time: '5 days ago',
        },
        {
          initials: 'DK',
          bg: 'bg-amber-100 text-amber-800',
          name: 'David Koranteng',
          loc: 'Cantonments, Accra',
          text: 'Ordered 3 pairs of men’s linen kaftans. Delivered in 4 days right to my office in Ridge. Excellent fabric quality.',
          time: '2 weeks ago',
        },
      ],
      calloutLabel: 'Measurement & Consultation',
      calloutPrice: 'GH₵ 50',
      arrivalNote: 'Upon arrival',
    };
  }

  // Plumbing & Pipefitting (Yaw Boateng)
  if (art.category === 'plumbers' || art.id === 'artisan-yaw-plumbing') {
    return {
      subrole: 'Certified Master Plumber & Water Systems Specialist',
      voiceLang: 'Twi & English',
      languages: 'Speaks: English, Twi, Ga',
      guaranteeLocation: 'Dansoman, Kaneshie & Accra',
      services: [
        {
          title: 'Water Pump & Polytank Automation',
          desc: 'Float switches, pressure pumps & piping',
          price: 'From GH₵ 250',
          icon: <Zap size={18} />,
        },
        {
          title: 'Bathroom & Sanitary Ware Fitting',
          desc: 'Concealed cisterns, showers & mixers',
          price: 'From GH₵ 180',
          icon: <Cog size={18} className="text-black" />,
        },
        {
          title: 'Emergency Leak Tracing & Pipe Repair',
          desc: 'PPR pipe welding & high-pressure fixes',
          price: 'From GH₵ 120',
          icon: <SlidersHorizontal size={18} />,
        },
        {
          title: 'Drainage & Biofil Maintenance',
          desc: 'Clog clearing & soakaway overhaul',
          price: 'From GH₵ 300',
          icon: <Hammer size={18} />,
        },
      ],
      portfolio: [
        {
          title: 'Pressure Booster Pump Setup',
          tag: 'Water System',
          sub: 'Dansoman • Automatic Controller',
          img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'Luxury Concealed Shower Mixer',
          tag: 'Sanitary',
          sub: 'East Legon • Matt Black Finish',
          img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80',
        },
        {
          title: 'PPR Overhead Line Installation',
          tag: 'Piping',
          sub: 'Kaneshie • 3-Storey Run',
          img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=500&q=80',
        },
      ],
      reviews: [
        {
          initials: 'EA',
          bg: 'bg-slate-100 text-slate-700',
          name: 'Emmanuel Aryee',
          loc: 'Dansoman, Accra',
          text: 'Fixed our persistent low-pressure borehole line. Replaced the faulty pressure switch within 1 hour. Professional and clean.',
          time: '3 days ago',
        },
        {
          initials: 'TA',
          bg: 'bg-slate-100 text-slate-700',
          name: 'Theresa Addo',
          loc: 'Kaneshie, Accra',
          text: 'Installed 2 complete bathroom sets for our rental units. Zero leaks and very fair pricing for the work quality.',
          time: '1 week ago',
        },
      ],
      calloutLabel: 'Plumbing Diagnosis & Inspection',
      calloutPrice: 'GH₵ 100',
      arrivalNote: 'Upon arrival',
    };
  }

  // 6. Default: Woodworking / Carpenter (Kofi Mensah)
  return {
    subrole: 'Master Woodworker & Interior Finishing',
    voiceLang: 'Twi & English',
    languages: 'Speaks: English, Twi, Ga',
    guaranteeLocation: 'Accra metropolis',
    services: [
      {
        title: 'Custom Wardrobe',
        desc: 'Full custom floor-to-ceiling cabinetry & closet',
        price: 'From GH₵ 1,800',
        icon: <Armchair size={18} />,
      },
      {
        title: 'Furniture Repair',
        desc: 'Precision joint restoration & structural reinforcement',
        price: 'From GH₵ 250',
        icon: <Cog size={18} className="text-black" />,
      },
      {
        title: 'Kitchen Installation',
        desc: 'Custom island, soft-close cabinets & countertops',
        price: 'From GH₵ 2,400',
        icon: <Hammer size={18} />,
      },
      {
        title: 'Door Realignment & Locks',
        desc: 'Precision hanging, mortise locks & draft seal',
        price: 'From GH₵ 200',
        icon: <DoorClosed size={18} />,
      },
    ],
    portfolio: [
      {
        title: 'Custom Media Unit',
        tag: 'TV Console',
        sub: 'Cantonments • Odum Wood',
        img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Solid Mahogany Table',
        tag: 'Dining Set',
        sub: 'East Legon • 6 Seater',
        img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Modular Kitchen Set',
        tag: 'Cabinetry',
        sub: 'Airport Hills • Fitted',
        img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Teak Platform Bed',
        tag: 'Bedroom',
        sub: 'Spintex • King Size',
        img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Executive Hardwood Desk',
        tag: 'Office',
        sub: 'Ridge • Solid Odum',
        img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Floating Live-Edge Shelves',
        tag: 'Living Room',
        sub: 'Labone • Natural Grain',
        img: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Acoustic Wood Slat Wall',
        tag: 'Feature Wall',
        sub: 'Trassaco • Sound-Dampened',
        img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=500&q=80',
      },
      {
        title: 'Walk-In Wardrobe System',
        tag: 'Closet',
        sub: 'East Legon • Soft-Close',
        img: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=500&q=80',
      },
    ],
    reviews: [
      {
        initials: 'KA',
        bg: 'bg-emerald-100 text-emerald-800',
        name: 'Kwame Asante',
        loc: 'East Legon, Accra',
        text: 'Built a solid hardwood dining set for my home. Punctual, very neat work and finished in 4 days. He even treated the wood for humidity protection.',
        time: '3 days ago',
      },
      {
        initials: 'AO',
        bg: 'bg-amber-100 text-amber-800',
        name: 'Abena Osei',
        loc: 'Spintex, Accra',
        text: 'Replaced all our interior bedroom doors. Paid him cash after inspecting the smooth latching. Very honest gentleman, highly recommended!',
        time: '2 weeks ago',
      },
    ],
    calloutLabel: 'Inspection & Call-out',
    calloutPrice: 'GH₵ 150',
    arrivalNote: 'Upon arrival',
  };
};
