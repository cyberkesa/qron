'use client';

import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import {
  InformationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { InfoCircleIcon } from '@/components/Icons';
import clsx from 'clsx';

// Тип для табов
type TabType = 'description' | 'specs';

interface ProductAttribute {
  name: string;
  value: string;
}

interface ProductTabsProps {
  description: string;
  attributes?: ProductAttribute[];
}

const ProductTabs = ({ description, attributes = [] }: ProductTabsProps) => {
  // Создаем массив табов в зависимости от наличия контента
  const tabs = [];

  // Добавляем вкладку "Описание" только если оно не пустое
  if (description) {
    tabs.push({
      id: 'description',
      label: 'Описание',
      icon: <InfoCircleIcon className="h-5 w-5" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      ),
    });
  }

  // Добавляем вкладку "Характеристики" если есть атрибуты
  if (attributes && attributes.length > 0) {
    tabs.push({
      id: 'specs',
      label: 'Характеристики',
      icon: <ChartBarIcon className="h-5 w-5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {attributes.map((attribute) => (
            <div key={attribute.name} className="py-1">
              <div className="text-sm font-medium text-gray-500">
                {attribute.name}
              </div>
              <div className="text-base font-medium text-gray-900 mt-1">
                {attribute.value}
              </div>
            </div>
          ))}
        </div>
      ),
    });
  }

  const [selectedTab, setSelectedTab] = useState(0);

  // Если нет табов для отображения, возвращаем null
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 bg-gray-50 p-2 border-b border-gray-100">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                clsx(
                  'w-full py-2.5 text-sm font-medium rounded-lg flex items-center justify-center',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  selected
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/[0.5]'
                )
              }
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="p-4 md:p-6">
          {tabs.map((tab) => (
            <Tab.Panel key={tab.id}>{tab.content}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ProductTabs;
