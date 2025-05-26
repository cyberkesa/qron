'use client';

import Link from 'next/link';
import { memo } from 'react';

// Компонент для ссылки навигации в мобильном меню
const MobileNavLink = memo(
  ({
    href,
    active,
    onClick,
    children,
  }: {
    href: string;
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <li>
      <Link
        href={href}
        className={`
          flex items-center h-12 px-4 rounded-xl font-medium text-base
          transition-all duration-200 active:scale-[0.98] touch-manipulation
          ${
            active
              ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
          }
        `}
        onClick={onClick}
      >
        {children}
      </Link>
    </li>
  )
);

MobileNavLink.displayName = 'MobileNavLink';

export default MobileNavLink;
