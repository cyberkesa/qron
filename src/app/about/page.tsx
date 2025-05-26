'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">О компании Крон</h1>
      <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 mb-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 mb-4">
              <b>Компания Крон</b> — это быстро развивающаяся компания, которая
              насчитывает штат из более 50 сотрудников по всей России, имеет
              собственный парк автомобилей, а также собственное производство
              товаров народного потребления в России.
            </p>
            <p className="text-gray-700 mb-4">
              Мы являемся прямым экспортером крупнейших производителей Китая,
              Индии, Ирана, Армении, Узбекистана, Туркменистана и Вьетнама в
              сфере товаров для сада и огорода, а также хозяйственных товаров.
              Наши марки под брендом «Крон», «Крон эксперт», «Крон эконом»
              зарекомендовали себя на рынке как лучшее соотношение цены и
              качества. Мы также можем помочь вам импортировать товары из выше
              перечисленных стран.
            </p>
            <p className="text-gray-700 mb-4">
              Наше преимущество — это современные технологии: для удобства
              клиентов мы разработали мобильные приложения и онлайн-каталог, где
              вы можете ознакомиться с ассортиментом в любое время.
            </p>
            <p className="text-gray-700 mb-6">
              <b>История:</b> Компания была основана в 2010 году и за это время
              прошла путь от небольшого регионального поставщика до федерального
              игрока с широкой сетью партнеров и клиентов по всей России.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Перейти в каталог
              <ChevronRightIcon className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600 text-sm">Сотрудников</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
                <div className="text-gray-600 text-sm">Стран-партнёров</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  24/7
                </div>
                <div className="text-gray-600 text-sm">Поддержка</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-gray-600 text-sm">Собственных бренда</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prose max-w-none mb-10">
        <h2>Миссия и ценности</h2>
        <p>
          Наша миссия — сделать качественные товары для дома, сада и огорода
          доступными для каждого жителя России. Мы ценим честность, инновации,
          заботу о клиентах и долгосрочные партнерские отношения.
        </p>
        <ul>
          <li>Честность и открытость в работе с клиентами и партнерами</li>
          <li>Постоянное развитие и внедрение новых технологий</li>
          <li>Ответственность за качество продукции</li>
          <li>Забота о сотрудниках и клиентах</li>
        </ul>
      </div>

      <div className="prose max-w-none mb-10">
        <h2>География деятельности</h2>
        <p>
          Мы работаем по всей России, а также сотрудничаем с компаниями из стран
          СНГ и Азии. Наши склады и логистические центры расположены в ключевых
          регионах страны, что позволяет быстро доставлять товары клиентам.
        </p>
      </div>

      <div className="prose max-w-none mb-10">
        <h2>Партнеры и бренды</h2>
        <ul>
          <li>
            Собственные бренды: <b>Крон</b>, <b>Крон эксперт</b>,{' '}
            <b>Крон эконом</b>
          </li>
          <li>
            Партнеры: ведущие производители из Китая, Индии, Ирана, Армении,
            Узбекистана, Туркменистана, Вьетнама
          </li>
        </ul>
      </div>

      <div className="prose max-w-none mb-10">
        <h2>Отзывы клиентов</h2>
        <blockquote>
          &laquo;Работаем с&nbsp;Крон уже несколько лет&nbsp;&mdash; всегда
          отличные цены и&nbsp;быстрая доставка!&raquo;&nbsp;&mdash; ООО
          &laquo;СтройГарант&raquo;
        </blockquote>
        <blockquote>
          «Очень удобно, что есть мобильное приложение и онлайн-каталог.
          Ассортимент постоянно расширяется!» — ИП Иванова
        </blockquote>
      </div>

      <div className="prose max-w-none mb-10">
        <h2>Сертификаты и гарантии</h2>
        <p>
          Вся продукция сертифицирована и соответствует стандартам качества.{' '}
          <i>
            (Здесь могут быть размещены сканы сертификатов и наград компании)
          </i>
        </p>
      </div>

      <div className="prose max-w-none">
        <h2>Контакты</h2>
        <p>
          По вопросам сотрудничества и оптовых закупок пишите на{' '}
          <a href="mailto:info@tovari-kron.ru">info@tovari-kron.ru</a> или
          звоните <a href="tel:+74957992666">+7 (495) 799-26-66</a>.
        </p>
      </div>
    </div>
  );
}
