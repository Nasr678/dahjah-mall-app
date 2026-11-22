import React from 'react';
import {
  Award,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  Headphones,
  Heart,
  HelpCircle,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Percent,
  Phone,
  Play,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';

interface DynamicLucideIconProps {
  name?: string;
  className?: string;
  size?: number;
  defaultIcon?: React.ReactNode;
}

// Explicit icon registry so Vite can tree-shake lucide-react (~800 KB reduction vs `import *`)
const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  Headphones,
  Heart,
  HelpCircle,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Percent,
  Phone,
  Play,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  Zap,
  // Common lowercase / social aliases
  whatsapp: MessageCircle,
  telegram: Share2,
  facebook: Globe,
  tiktok: Play,
  instagram: Sparkles,
};

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  name,
  className = 'w-4 h-4',
  size,
  defaultIcon,
}) => {
  if (!name) {
    return defaultIcon ? <>{defaultIcon}</> : <ShoppingBag className={className} size={size} />;
  }

  const normalized = name.trim();
  const formattedName = normalized
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());

  const IconComponent =
    ICON_MAP[normalized] ||
    ICON_MAP[normalized.toLowerCase()] ||
    ICON_MAP[formattedName];

  if (!IconComponent) {
    return defaultIcon ? <>{defaultIcon}</> : <ShoppingBag className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};
