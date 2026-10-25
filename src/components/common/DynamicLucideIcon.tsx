import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicLucideIconProps {
  name?: string;
  className?: string;
  size?: number;
  defaultIcon?: React.ReactNode;
}

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  name,
  className = 'w-4 h-4',
  size,
  defaultIcon,
}) => {
  if (!name) {
    return defaultIcon ? <>{defaultIcon}</> : <LucideIcons.Sparkles className={className} size={size} />;
  }

  // Normalize icon name format (e.g. "shield-check" -> "ShieldCheck", "map_pin" -> "MapPin")
  const formattedName = name
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());

  // Try finding icon by formatted name or raw name
  const IconComponent = 
    (LucideIcons as Record<string, any>)[formattedName] || 
    (LucideIcons as Record<string, any>)[name] ||
    (LucideIcons as Record<string, any>)[`${formattedName}Icon`];

  if (!IconComponent) {
    return defaultIcon ? <>{defaultIcon}</> : <LucideIcons.Sparkles className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};
