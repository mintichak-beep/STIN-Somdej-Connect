import { useState } from 'react';
import { AssetImage } from './AssetImage';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl font-bold',
  };

  const initials = getInitials(name);

  // Generate a soft consistent background color based on name
  const getBgColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-600 text-white',
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-teal-600 text-white',
      'bg-rose-600 text-white',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const bgStyle = getBgColor(name);

  if (src && !imageError) {
    return (
      <AssetImage
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200 dark:border-zinc-800 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-medium shadow-sm border border-black/5 ${sizeClasses[size]} ${bgStyle} ${className}`}
    >
      {initials}
    </div>
  );
}
