import React from 'react';
import { HARAKA_LOGO } from '../lib/images';
import { useBranding } from '../lib/branding';

interface HarakaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function HarakaLogo({
  className = '',
  size = 'md',
  showText = true,
}: HarakaLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-11 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
  };

  // The system admin can replace the logo from the dashboard
  const { logoUrl } = useBranding();
  const appliedClass = className || (size ? sizeClasses[size] : 'h-10 w-auto');

  return (
    <img
      src={logoUrl || HARAKA_LOGO}
      alt="Haraka"
      className={`object-contain ${appliedClass}`}
    />
  );
}

export { HarakaLogo };
