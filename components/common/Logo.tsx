import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LogoProps {
  variant?: 'horizontal' | 'icon' | 'image-horizontal' | 'image-full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = '',
  href = '/',
  priority = false,
}: LogoProps) {
  if (variant === 'image-horizontal') {
    const imgContent = (
      <Image
        src="/logo-horizontal.png"
        alt="ComplainTrack"
        width={240}
        height={55}
        className={`h-9 w-auto object-contain drop-shadow-sm ${className}`}
        priority={priority}
      />
    );
    return href ? <Link href={href} className="inline-block">{imgContent}</Link> : imgContent;
  }

  if (variant === 'image-full') {
    const imgContent = (
      <Image
        src="/logo.png"
        alt="ComplainTrack"
        width={360}
        height={360}
        className={`w-full max-w-[280px] h-auto object-contain drop-shadow-sm ${className}`}
        priority={priority}
      />
    );
    return href ? <Link href={href} className="inline-block">{imgContent}</Link> : imgContent;
  }

  const iconSizes = {
    sm: { w: 32, h: 32, class: 'h-8 w-8' },
    md: { w: 40, h: 40, class: 'h-10 w-10' },
    lg: { w: 48, h: 48, class: 'h-12 w-12' },
    xl: { w: 64, h: 64, class: 'h-16 w-16' },
  };

  const textSizes = {
    sm: { title: 'text-base', tag: 'text-[9px]' },
    md: { title: 'text-lg', tag: 'text-[10px]' },
    lg: { title: 'text-xl', tag: 'text-xs' },
    xl: { title: 'text-2xl', tag: 'text-sm' },
  };

  const content = (
    <div className={`flex items-center space-x-3 group select-none ${className}`}>
      <Image
        src="/logo-icon.png"
        alt="ComplainTrack Logo"
        width={iconSizes[size].w}
        height={iconSizes[size].h}
        className={`${iconSizes[size].class} object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0`}
        priority={priority}
      />
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <span className={`${textSizes[size].title} font-extrabold text-slate-900 leading-tight tracking-tight`}>
            Complain<span className="text-blue-600">Track</span>
          </span>
          {showTagline && (
            <span className={`${textSizes[size].tag} text-slate-500 font-semibold uppercase tracking-wider block`}>
              Raise • Track • Resolve
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
