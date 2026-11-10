import React from 'react';
import { 
  Utensils, Home, Car, Film, Zap, ShoppingBag, 
  HeartPulse, BookOpen, Smile, Briefcase, Laptop, 
  TrendingUp, Gift, PlusCircle, Tag, Coffee, 
  Plane, Smartphone, DollarSign, CreditCard, Award
} from 'lucide-react';

const iconMap = {
  Utensils,
  Home,
  Car,
  Film,
  Zap,
  ShoppingBag,
  HeartPulse,
  BookOpen,
  Smile,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Coffee,
  Plane,
  Smartphone,
  DollarSign,
  CreditCard,
  Award,
  Tag
};

export default function CategoryIcon({ name, className = "w-5 h-5", color }) {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
}

export const availableIcons = Object.keys(iconMap);

