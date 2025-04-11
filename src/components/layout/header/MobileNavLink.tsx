"use client";

import Link from "next/link";
import { memo } from "react";

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
        className={`block py-2 px-3 rounded-md ${
          active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
        }`}
        onClick={onClick}
      >
        {children}
      </Link>
    </li>
  ),
);

MobileNavLink.displayName = "MobileNavLink";

export default MobileNavLink;
