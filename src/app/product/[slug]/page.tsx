"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useRouter } from "next/navigation";
import React from "react";
import {
  GET_PRODUCT,
  ADD_TO_CART,
  GET_CURRENT_REGION,
  GET_REGIONS,
} from "@/lib/queries";
import {
  Product,
  ProductStockAvailabilityStatus,
  Category,
  ProductSortOrder,
} from "@/types/api";
import { Region as ApiRegion } from "@/types/api";
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  MapPinIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  CurrencyRupeeIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";

// Типы для компонента страницы продукта
interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Тип для табов
type TabType = "description" | "specs" | "delivery";

interface ProductAttribute {
  name: string;
  value: string;
}

// Локальный интерфейс для региона, соответствующий ApiRegion
interface Region {
  id: string;
  name: string;
}

// Компонент страницы продукта
export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const client = useApolloClient();

  // Извлекаем slug из params с помощью React.use()
  const { slug } = React.use(params);

  // Состояния компонента
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [addNotification, setAddNotification] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [notAvailableInRegion, setNotAvailableInRegion] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Получаем текущий регион при загрузке страницы
  const { data: regionData, loading: regionLoading } =
    useQuery(GET_CURRENT_REGION);

  // Получаем данные о продукте, передавая slug из URL
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { slug: decodeURIComponent(slug) },
  });

  const { data: regionsData } = useQuery(GET_REGIONS);

  const [addToCart] = useMutation(ADD_TO_CART, {
    onCompleted(data) {
      if (data && data.addToCart) {
        setAddNotification(true);
        setTimeout(() => {
          setAddNotification(false);
        }, 3000);
        setIsAddingToCart(false);
      }
    },
    onError(error) {
      console.error("Error adding to cart:", error);
      alert(
        "Не удалось добавить товар в корзину. Пожалуйста, попробуйте позже."
      );
      setIsAddingToCart(false);
    },
  });

  useEffect(() => {
    if (regionData && regionData.viewer && regionData.viewer.region) {
      setCurrentRegion(regionData.viewer.region);
    } else {
      // Проверяем localStorage, если API не вернул регион
      const savedRegion =
        typeof window !== "undefined"
          ? localStorage.getItem("selectedRegion")
          : null;

      if (savedRegion) {
        try {
          setCurrentRegion(JSON.parse(savedRegion));
        } catch (e) {
          console.error("Error parsing saved region:", e);
        }
      }
    }
  }, [regionData]);

  useEffect(() => {
    if (data && data.productBySlug && currentRegion) {
      // Проверка доступности товара в регионе
      // Для демонстрации предполагаем, что товар доступен во всех регионах
      // В реальном приложении здесь должна быть логика проверки доступности
      setNotAvailableInRegion(
        data.productBySlug.stockAvailabilityStatus ===
          ProductStockAvailabilityStatus.OUT_OF_STOCK
      );
    }
  }, [data, currentRegion]);

  const handleAddToCart = async () => {
    if (!data || !data.productBySlug || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      console.log(
        "Добавляем в корзину товар ID:",
        data.productBySlug.id,
        "в количестве:",
        quantity
      );

      await addToCart({
        variables: {
          productId: data.productBySlug.id,
          quantity,
        },
      });

      // Обновляем кэш корзины
      await client.refetchQueries({
        include: ["GetCart"],
      });

      // Показываем уведомление об успешном добавлении
      setAddNotification(true);

      // Скрываем уведомление через 3 секунды
      setTimeout(() => {
        setAddNotification(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        "Не удалось добавить товар в корзину. Пожалуйста, попробуйте позже."
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const changeQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxQuantity = data.productBySlug.stock || 999;

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg w-96 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Ошибка загрузки товара
            </h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
            <button
              onClick={() => router.refresh()}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.productBySlug) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-yellow-800">
            Товар не найден
          </h2>
          <p className="mt-2 text-yellow-700">
            К сожалению, запрашиваемый товар не существует или был удален.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const product = data.productBySlug;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: "main", url: product.image || "/placeholder-image.jpg" }];

  // Извлекаем атрибуты товара, если они есть
  const productAttributes = (product as any).attributes || [];

  const renderRegionSelection = () => {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Выберите регион:</p>
        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={currentRegion?.id || ""}
          onChange={(e) => {
            const selectedRegion = regionsData?.regions.find(
              (r: Region) => r.id === e.target.value
            );
            if (selectedRegion) {
              localStorage.setItem(
                "selectedRegion",
                JSON.stringify(selectedRegion)
              );
              setCurrentRegion(selectedRegion);
              window.location.reload(); // Перезагрузка для применения нового региона
            }
          }}
        >
          <option value="">Выберите регион</option>
          {regionsData?.regions?.map((region: Region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-6">
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
                <Link
                  href="/categories"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Категории
                </Link>
              </div>
            </li>
            {product.category && (
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
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {product.category.title}
                  </Link>
                </div>
              </li>
            )}
            <li aria-current="page">
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
                <span className="text-gray-500 truncate max-w-[150px] md:max-w-xs">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Галерея изображений */}
        <div className="space-y-4">
          <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden h-[300px] md:h-[400px] flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[selectedImageIndex].url}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <PhotoIcon className="h-16 w-16 mb-2" />
                <span>Изображение отсутствует</span>
              </div>
            )}

            {/* Навигация по изображениям */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {/* Миниатюры изображений */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image: any, index: number) => (
                <button
                  key={image.id}
                  className={`relative border-2 rounded-md w-20 h-20 flex-shrink-0 focus:outline-none ${
                    selectedImageIndex === index
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - изображение ${index + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            {product.sku && (
              <span className="text-sm text-gray-500">
                Артикул: {product.sku}
              </span>
            )}
          </div>

          {/* Цена и наличие */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat("ru-RU").format(product.price)}
                </span>
                <span className="ml-1 text-xl text-gray-900">₽</span>

                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="ml-3 text-lg text-gray-500 line-through">
                    {new Intl.NumberFormat("ru-RU").format(product.oldPrice)} ₽
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Регион:{" "}
                  {currentRegion?.name ||
                    regionData?.viewer?.region?.name ||
                    "Не выбран"}
                </span>
                <button
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                  onClick={() => setShowRegionModal(!showRegionModal)}
                >
                  Изменить
                </button>
              </div>

              {showRegionModal && renderRegionSelection()}

              {/* Статус наличия */}
              {!notAvailableInRegion ? (
                <div className="flex items-center text-green-700">
                  <CheckIcon className="h-5 w-5 mr-1.5" />
                  <span className="font-medium">В наличии</span>
                  {product.stock > 0 && (
                    <span className="ml-1 text-sm">
                      ({product.stock} {product.unit || "шт"})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XMarkIcon className="h-5 w-5 mr-1.5" />
                  <span className="font-medium">
                    Нет в наличии в вашем регионе
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Добавление в корзину */}
          {!notAvailableInRegion && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-gray-700 mr-4 font-medium">
                  Количество:
                </span>
                <div className="flex border border-gray-300 rounded-md shadow-sm">
                  <button
                    className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
                    onClick={() => changeQuantity(-1)}
                    disabled={quantity <= 1 || isAddingToCart}
                    aria-label="Уменьшить количество"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 999}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (
                        !isNaN(value) &&
                        value >= 1 &&
                        value <= (product.stock || 999)
                      ) {
                        setQuantity(value);
                      }
                    }}
                    className="w-16 text-center border-none focus:ring-0"
                    disabled={isAddingToCart}
                  />
                  <button
                    className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
                    onClick={() => changeQuantity(1)}
                    disabled={
                      quantity >= (product.stock || 999) || isAddingToCart
                    }
                    aria-label="Увеличить количество"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                className={`w-full py-3 px-6 rounded-md font-medium flex items-center justify-center transition-all duration-300 ${
                  addNotification
                    ? "bg-green-600 hover:bg-green-700 text-white transform scale-105"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleAddToCart}
                disabled={isAddingToCart || notAvailableInRegion}
              >
                {isAddingToCart ? (
                  <>
                    <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    <span>Добавление...</span>
                  </>
                ) : addNotification ? (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    <span>Добавлено в корзину</span>
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    <span>Добавить в корзину</span>
                    {quantity > 1 && (
                      <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-sm">
                        × {quantity}
                      </span>
                    )}
                  </>
                )}
              </button>

              {addNotification && (
                <div className="mt-4 flex justify-between items-center bg-green-50 p-3 rounded-md border border-green-200 text-green-800">
                  <span className="flex items-center">
                    <CheckIcon className="h-5 w-5 mr-2 text-green-600" />
                    Товар успешно добавлен в корзину
                  </span>
                  <Link
                    href="/cart"
                    className="text-sm font-medium text-green-700 hover:text-green-900 flex items-center"
                  >
                    Перейти в корзину
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Характеристики доставки */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Преимущества заказа
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <TruckIcon className="h-5 w-5 text-gray-600 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  Доставка от 1 дня по всей России
                </span>
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  Гарантия качества на все товары
                </span>
              </li>
              <li className="flex items-start">
                <CurrencyRupeeIcon className="h-5 w-5 text-gray-600 mt-0.5 mr-2" />
                <span className="text-sm text-gray-700">
                  Возможна оплата при получении
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Вкладки с информацией */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("description")}
            className={`py-3 px-4 border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "description"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Описание
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-3 px-4 border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "specs"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Характеристики
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`py-3 px-4 border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "delivery"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Доставка и оплата
          </button>
        </div>
      </div>

      {/* Содержимое вкладок */}
      <div className="mb-10">
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {activeTab === "specs" && (
          <div className="bg-white rounded-lg">
            {productAttributes && productAttributes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productAttributes.map(
                  (attr: ProductAttribute, index: number) => (
                    <div key={index} className="border-b border-gray-100 py-2">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-600">{attr.name}:</span>
                        <span className="font-medium text-gray-900">
                          {attr.value}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500">Характеристики отсутствуют</p>
            )}
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="prose max-w-none">
            <h3>Доставка</h3>
            <p>
              Мы осуществляем доставку по всей России. Сроки доставки зависят от
              вашего региона и обычно составляют от 1 до 7 рабочих дней.
            </p>
            <h3>Оплата</h3>
            <p>Доступны следующие способы оплаты:</p>
            <ul>
              <li>Оплата онлайн картой на сайте</li>
              <li>Оплата наличными или картой при получении</li>
              <li>Оплата по безналичному расчету (для юридических лиц)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Модальное окно с увеличенным изображением */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <button
              className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors"
              onClick={() => setIsGalleryOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="relative h-[80vh]">
              <Image
                src={images[selectedImageIndex].url}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
