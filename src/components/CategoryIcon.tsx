import React from 'react';
import {
  ShoppingCart,
  Home,
  Zap,
  Car,
  UtensilsCrossed,
  HeartPulse,
  ShoppingBag,
  Film,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  MoreHorizontal,
  CreditCard,
  Banknote,
  DollarSign,
  ShieldCheck,
  Palmtree,
  Target,
  Gift,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart,
  Home,
  Zap,
  Car,
  UtensilsCrossed,
  HeartPulse,
  ShoppingBag,
  Film,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  MoreHorizontal,
  CreditCard,
  Banknote,
  DollarSign,
  ShieldCheck,
  Palmtree,
  Target,
  Gift
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
};
