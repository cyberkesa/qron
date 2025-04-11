"use client";

import Link from "next/link";
import { memo } from "react";
import {
  PhoneIcon,
  TruckIcon,
  InformationCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import RegionSelector, {
  REGION_CONTACTS,
} from "@/components/region/RegionSelector";

// Мемоизированный компонент верхней панели хедера
const TopBar = memo(
  ({ regionContacts }: { regionContacts: typeof REGION_CONTACTS.MOSCOW }) => (
    <div className="bg-gray-50 py-2 text-xs border-b border-gray-200">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <RegionSelector />
          <a
            href={regionContacts.phoneLink}
            className="text-gray-600 hover:text-blue-600 flex items-center"
          >
            <PhoneIcon className="h-3.5 w-3.5 mr-1" />
            <span>{regionContacts.phone}</span>
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/delivery"
            className="text-gray-600 hover:text-blue-600 flex items-center"
          >
            <TruckIcon className="h-3.5 w-3.5 mr-1" />
            <span>Доставка</span>
          </Link>
          <Link
            href="/about"
            className="text-gray-600 hover:text-blue-600 flex items-center"
          >
            <InformationCircleIcon className="h-3.5 w-3.5 mr-1" />
            <span>О компании</span>
          </Link>
          <Link
            href="/contacts"
            className="text-gray-600 hover:text-blue-600 flex items-center"
          >
            <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
            <span>Контакты</span>
          </Link>
        </div>
      </div>
    </div>
  ),
);

TopBar.displayName = "TopBar";

export default TopBar;
