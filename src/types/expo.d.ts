/* Type declarations for Expo & React Native in web/universal context */

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const Image: any;
  export const ScrollView: any;
  export const Pressable: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    absoluteFillObject?: any;
  };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => void;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: (obj: any) => any;
  };
  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
  };
  export const Share: {
    share: (content: { message: string; title?: string; url?: string }) => Promise<any>;
  };
  export const Linking: {
    openURL: (url: string) => Promise<any>;
  };
  export const Switch: any;
  export const RefreshControl: any;
  export const KeyboardAvoidingView: any;
  export const Modal: any;
  export const ActivityIndicator: any;
  export const Animated: any;
}

declare module 'expo-router' {
  export const useRouter: () => {
    push: (href: any) => void;
    replace: (href: any) => void;
    back: () => void;
    canGoBack: () => boolean;
  };
  export const useLocalSearchParams: <T = Record<string, string>>() => T;
  export const Stack: any;
  export const Tabs: any;
  export const Slot: any;
  export const Link: any;
}

declare module 'expo-image' {
  export const Image: any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'lucide-react-native' {
  export const Home: any;
  export const Grid: any;
  export const PlusCircle: any;
  export const Plus: any;
  export const MessageSquare: any;
  export const Bookmark: any;
  export const Search: any;
  export const MapPin: any;
  export const Bell: any;
  export const CheckCircle: any;
  export const CheckCircle2: any;
  export const Heart: any;
  export const SlidersHorizontal: any;
  export const ShieldCheck: any;
  export const ShieldAlert: any;
  export const Zap: any;
  export const Tag: any;
  export const Truck: any;
  export const ArrowRight: any;
  export const ArrowLeft: any;
  export const Camera: any;
  export const X: any;
  export const Check: any;
  export const ChevronRight: any;
  export const ChevronDown: any;
  export const Sparkles: any;
  export const DollarSign: any;
  export const Phone: any;
  export const MessageCircle: any;
  export const Flame: any;
  export const Rocket: any;
  export const Award: any;
  export const Trash2: any;
  export const TrendingDown: any;
  export const TrendingUp: any;
  export const ShoppingBag: any;
  export const AlertTriangle: any;
  export const Eye: any;
  export const EyeOff: any;
  export const User: any;
  export const Mail: any;
  export const Lock: any;
  export const CheckCheck: any;
  export const Star: any;
  export const Cog: any;
  export const Settings: any;
  export const Wrench: any;
  export const Calendar: any;
  export const Paperclip: any;
  export const Send: any;
  export const Share2: any;
  export const Briefcase: any;
  export const Armchair: any;
  export const Sofa: any;
  export const Smartphone: any;
  export const Headphones: any;
  export const Car: any;
  export const CarFront: any;
  export const Laptop: any;
  export const Shirt: any;
  export const Package: any;
  export const HelpCircle: any;
  export const LogOut: any;
  export const Mic: any;
  export const Play: any;
  export const Pause: any;
  export const Square: any;
  export const Volume2: any;
  export const Upload: any;
  export const Crosshair: any;
  export const Clock: any;
  export const AlertCircle: any;
  export const XCircle: any;
  export const Pencil: any;
  export const Edit: any;
  export const Edit3: any;
  export const Store: any;
  export const Banknote: any;
  export const Building2: any;
  export const BadgeCheck: any;
  export const Gauge: any;
  export const LayoutDashboard: any;
  export const Navigation: any;
  export const CreditCard: any;
}
