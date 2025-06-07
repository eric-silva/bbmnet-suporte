
'use client';
import * as React from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Ensure the first letter is capitalized as lucide-react exports icons like "Home", "User", etc.
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const LucideIcon = (Icons as any)[capitalizedName];

  if (!LucideIcon) {
    console.warn(`Icon "${capitalizedName}" (from "${name}") not found in lucide-react. Falling back to HelpCircle.`);
    return <Icons.HelpCircle {...props} />; 
  }

  return <LucideIcon {...props} />;
};

export default DynamicIcon;
