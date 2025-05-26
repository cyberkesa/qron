'use client';

import Link from 'next/link';
import { memo } from 'react';
import {
  PhoneIcon,
  TruckIcon,
  InformationCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import RegionSelector, {
  REGION_CONTACTS,
} from '@/components/region/RegionSelector';

// Мемоизированный компонент верхней панели хедера
const TopBar = memo(
  ({ regionContacts }: { regionContacts: typeof REGION_CONTACTS.MOSCOW }) => (
    <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/60">
      <div className="header-container">
        <div className="flex items-center justify-between h-8 md:h-10">
          {/* Левая часть - регион и телефон */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <RegionSelector />
            <a
              href={regionContacts.phoneLink}
              className="text-gray-600 hover:text-blue-600 flex items-center transition-all duration-200 text-xs md:text-sm font-medium hover:scale-105 active:scale-95"
            >
              <PhoneIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">{regionContacts.phone}</span>
              <span className="sm:hidden">
                {regionContacts.phone.replace(/\s/g, '')}
              </span>
            </a>
          </div>

          {/* Правая часть - навигационные ссылки (только на десктопе) */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/delivery"
              className="text-gray-600 hover:text-blue-600 flex items-center transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <TruckIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>Доставка</span>
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-blue-600 flex items-center transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <InformationCircleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>О компании</span>
            </Link>
            <Link
              href="/contacts"
              className="text-gray-600 hover:text-blue-600 flex items-center transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <EnvelopeIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>Контакты</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
);

TopBar.displayName = 'TopBar';

export default TopBar;
