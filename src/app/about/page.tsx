"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserGroupIcon,
  TrophyIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClockIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">О компании</h1>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                <span className="text-gray-500">О компании</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            КРОН Маркет – ваш надежный партнер в строительстве и ремонте
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Компания КРОН Маркет была основана в 2010 году и за это время
              выросла из небольшого магазина строительных материалов в крупную
              федеральную сеть с представительствами по всей России.
            </p>
            <p>
              Наша специализация – продажа строительных и отделочных материалов,
              инструментов, товаров для дома, сада и огорода. Мы предлагаем
              широкий ассортимент продукции как для профессиональных строителей,
              так и для частных лиц.
            </p>
            <p>
              Мы гордимся тем, что нам доверяют тысячи клиентов по всей стране.
              Наша миссия – сделать процесс строительства и ремонта доступным,
              быстрым и комфортным для каждого.
            </p>
          </div>
        </div>
        <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/company-building.jpg"
            alt="Главный офис КРОН Маркет"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg transition-transform hover:scale-105 duration-500"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-8 md:p-12 rounded-xl mb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Наши преимущества
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
            <div className="inline-flex p-3 rounded-full bg-blue-100 mb-4">
              <HandThumbUpIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Гарантия качества</h3>
            <p className="text-gray-600">
              Мы работаем только с проверенными производителями и предоставляем
              гарантию на всю продукцию
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
            <div className="inline-flex p-3 rounded-full bg-green-100 mb-4">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Широкий ассортимент</h3>
            <p className="text-gray-600">
              Более 50 000 наименований товаров для строительства, ремонта, дома
              и сада
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
            <div className="inline-flex p-3 rounded-full bg-yellow-100 mb-4">
              <TrophyIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Профессионализм</h3>
            <p className="text-gray-600">
              Наши консультанты всегда помогут с выбором материалов и
              инструментов для вашего проекта
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:scale-105">
            <div className="inline-flex p-3 rounded-full bg-red-100 mb-4">
              <ClockIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Быстрая доставка</h3>
            <p className="text-gray-600">
              Доставляем заказы в кратчайшие сроки по всей России с помощью
              собственной логистической службы
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Наши достижения
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">13</div>
            <div className="text-gray-600">лет на рынке</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">35+</div>
            <div className="text-gray-600">городов присутствия</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">сотрудников</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">100K+</div>
            <div className="text-gray-600">довольных клиентов</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Наша команда</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/team/ceo.jpg"
                alt="Алексей Петров"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-full"
              />
            </div>
            <h3 className="text-lg font-semibold">Алексей Петров</h3>
            <p className="text-gray-600">Генеральный директор</p>
          </div>

          <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/team/coo.jpg"
                alt="Елена Иванова"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-full"
              />
            </div>
            <h3 className="text-lg font-semibold">Елена Иванова</h3>
            <p className="text-gray-600">Операционный директор</p>
          </div>

          <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/team/cmo.jpg"
                alt="Дмитрий Сидоров"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-full"
              />
            </div>
            <h3 className="text-lg font-semibold">Дмитрий Сидоров</h3>
            <p className="text-gray-600">Директор по маркетингу</p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Наши партнеры</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24"
            >
              <Image
                src={`/partners/partner-${num}.png`}
                alt={`Партнер ${num}`}
                width={120}
                height={60}
                className="max-h-16 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Наши ценности</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-blue-100 mr-4 mt-1">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Клиентоориентированность
              </h3>
              <p className="text-gray-700">
                Мы всегда ставим потребности и удовлетворенность клиентов на
                первое место.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-full bg-green-100 mr-4 mt-1">
              <UserGroupIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Командная работа</h3>
              <p className="text-gray-700">
                Мы верим, что успех компании зависит от вклада каждого
                сотрудника и их способности работать вместе.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="p-2 rounded-full bg-yellow-100 mr-4 mt-1">
              <BuildingStorefrontIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Инновации</h3>
              <p className="text-gray-700">
                Мы постоянно ищем новые способы улучшить наш сервис и внедряем
                современные технологии.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Присоединяйтесь к нам!
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-6">
          Мы всегда рады новым клиентам и партнерам. Если у вас есть вопросы или
          предложения, свяжитесь с нами через форму обратной связи или по
          указанным контактам.
        </p>
        <Link
          href="/contacts"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Связаться с нами
        </Link>
      </div>
    </div>
  );
}
