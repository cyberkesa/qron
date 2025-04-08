"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  GET_VIEWER,
  GET_CART,
} from "@/lib/queries";
import { ProductStockAvailabilityStatus } from "@/types/api";
import {
  CheckIcon,
  XMarkIcon,
  ShoppingCartIcon,
  MapPinIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  CurrencyRupeeIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useViewHistory } from "@/lib/hooks/useViewHistory";
import { SimilarProducts } from "@/components/product-list/SimilarProducts";
import { useCartContext } from "@/lib/providers/CartProvider";
import { QuantityCounter } from "@/components/ui/QuantityCounter";
import { Notification } from "@/components/ui/Notification";
import { RecentlyViewed } from "@/components/product-list/RecentlyViewed";

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

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

// Новый компонент для галереи изображений
const ProductImageGallery = React.memo(
  ({
    images,
    productName,
  }: {
    images: ProductImage[];
    productName: string;
  }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Мемоизируем текущее изображение
    const currentImage = useMemo(() => {
      return images[selectedImageIndex] || images[0];
    }, [images, selectedImageIndex]);

    // Обработчик изменения изображения
    const handleImageChange = useCallback((index: number) => {
      setSelectedImageIndex(index);
    }, []);

    // Обработчик открытия/закрытия галереи
    const handleGalleryToggle = useCallback(() => {
      setIsGalleryOpen((prev) => !prev);
    }, []);

    return (
      <div className="flex flex-col space-y-4 relative md:sticky md:top-4 sm:pb-6">
        <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square relative">
          {currentImage ? (
            <>
              <Image
                src={currentImage.url}
                alt={currentImage.alt}
                className="object-contain p-6"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <button
                className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none"
                onClick={handleGalleryToggle}
                aria-label="Открыть полноэкранный просмотр"
              >
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <PhotoIcon className="h-16 w-16 mb-2" />
              <span>Изображение отсутствует</span>
            </div>
          )}

          {/* Навигация по изображениям */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none group"
                onClick={() =>
                  handleImageChange(
                    (selectedImageIndex - 1 + images.length) % images.length,
                  )
                }
                aria-label="Предыдущее изображение"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none group"
                onClick={() =>
                  handleImageChange((selectedImageIndex + 1) % images.length)
                }
                aria-label="Следующее изображение"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
              </button>
            </>
          )}
        </div>

        {/* Миниатюры изображений */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {images.map((image: ProductImage, index: number) => (
              <button
                key={image.id}
                className={`relative ${
                  selectedImageIndex === index
                    ? "border-2 border-blue-600 ring-2 ring-blue-200"
                    : "border border-gray-200 hover:border-gray-300"
                } rounded-lg aspect-square w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 transition-all focus:outline-none`}
                onClick={() => handleImageChange(index)}
                aria-label={`Выбрать изображение ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={`${productName} - изображение ${index + 1}`}
                  className="object-contain p-1"
                  width={80}
                  height={80}
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Полноэкранный просмотр галереи */}
        {isGalleryOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full">
              <button
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 transition-colors p-2 rounded-full text-white z-10"
                onClick={() => setIsGalleryOpen(false)}
                aria-label="Закрыть галерею"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="object-contain p-8"
                  width={1200}
                  height={1200}
                  sizes="100vw"
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-3 rounded-full text-white"
                    onClick={() =>
                      handleImageChange(
                        (selectedImageIndex - 1 + images.length) %
                          images.length,
                      )
                    }
                    aria-label="Предыдущее изображение"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-3 rounded-full text-white"
                    onClick={() =>
                      handleImageChange(
                        (selectedImageIndex + 1) % images.length,
                      )
                    }
                    aria-label="Следующее изображение"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Миниатюры в галерее */}
              {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image: ProductImage, index: number) => (
                      <button
                        key={image.id}
                        className={`relative ${
                          selectedImageIndex === index
                            ? "border-2 border-white"
                            : "border border-gray-600 opacity-70 hover:opacity-100"
                        } rounded-md w-16 h-16 transition-all focus:outline-none`}
                        onClick={() => handleImageChange(index)}
                        aria-label={`Выбрать изображение ${index + 1}`}
                      >
                        <Image
                          src={image.url}
                          alt={`${productName} - изображение ${index + 1}`}
                          className="object-contain p-1"
                          width={64}
                          height={64}
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

ProductImageGallery.displayName = "ProductImageGallery";

// Компонент страницы продукта
export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const client = useApolloClient();
  const { data: userData } = useQuery(GET_VIEWER);
  const { addToCart: unifiedAddToCart, cart: unifiedCart } = useCartContext();

  // Извлекаем slug из params с помощью React.use()
  const { slug } = React.use(params);

  // Состояния компонента
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(() => {
    if (typeof window === "undefined") return null;
    const savedRegion = localStorage.getItem("selectedRegion");
    return savedRegion ? JSON.parse(savedRegion) : null;
  });
  const [notAvailableInRegion, setNotAvailableInRegion] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "info"
  >("success");

  // Получаем текущий регион при загрузке страницы
  const { data: regionData } = useQuery(GET_CURRENT_REGION);

  // Получаем данные о продукте, передавая slug из URL
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { slug: decodeURIComponent(slug) },
    fetchPolicy: "cache-and-network",
  });

  const { data: regionsData } = useQuery(GET_REGIONS);

  const [addToCart] = useMutation(ADD_TO_CART, {
    onError: (error) => {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    },
  });

  const { addToHistory } = useViewHistory();

  // Мемоизируем изображения продукта
  const productImages = useMemo(() => {
    if (!data?.productBySlug?.images) return [];
    return data.productBySlug.images.map((image: ProductImage) => ({
      id: image.id,
      url: image.url,
      alt: data.productBySlug.name,
    }));
  }, [data?.productBySlug?.images, data?.productBySlug?.name]);

  // Обновляем регион только при изменении данных из API
  useEffect(() => {
    if (regionData?.viewer?.region) {
      setCurrentRegion(regionData.viewer.region);
    }
  }, [regionData?.viewer?.region]);

  // Проверяем доступность товара только при изменении данных о товаре или регионе
  useEffect(() => {
    if (data?.productBySlug && currentRegion) {
      const isOutOfStock =
        data.productBySlug.stockAvailabilityStatus ===
        ProductStockAvailabilityStatus.OUT_OF_STOCK;
      setNotAvailableInRegion(isOutOfStock);
    }
  }, [data?.productBySlug?.stockAvailabilityStatus, currentRegion]);

  // Устанавливаем начальное количество только при первой загрузке товара
  useEffect(() => {
    if (data?.productBySlug?.quantityMultiplicity && quantity === 1) {
      setQuantity(data.productBySlug.quantityMultiplicity);
    }
  }, [data?.productBySlug?.quantityMultiplicity]);

  // Добавляем товар в историю просмотров только один раз при загрузке
  useEffect(() => {
    if (data?.productBySlug) {
      addToHistory(data.productBySlug);
    }
  }, [data?.productBySlug?.id, addToHistory]); // Зависим только от ID товара

  // Получаем текущее количество товара в корзине
  const getCurrentCartQuantity = useCallback(() => {
    if (!data?.productBySlug) return 0;

    if (userData?.viewer) {
      const cartData = client.readQuery({ query: GET_CART });
      const cartItem = cartData?.cart?.items?.edges?.find(
        (edge: any) => edge.node.product.id === data.productBySlug.id,
      );
      return cartItem?.node?.quantity || 0;
    } else {
      const cartItem = unifiedCart.items.find(
        (item) => item.product.id === data.productBySlug.id,
      );
      return cartItem?.quantity || 0;
    }
  }, [data?.productBySlug?.id, userData?.viewer, unifiedCart, client]);

  const currentCartQuantity = useMemo(
    () => getCurrentCartQuantity(),
    [getCurrentCartQuantity],
  );

  const showNotificationWithMessage = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setNotificationMessage(message);
      setNotificationType(type);
      setShowNotification(true);
    },
    [],
  );

  const handleAddToCart = useCallback(async () => {
    if (!data || !data.productBySlug || isAddingToCart) return;

    try {
      setIsAddingToCart(true);

      if (userData?.viewer) {
        const result = await addToCart({
          variables: {
            productId: data.productBySlug.id,
            quantity,
          },
        });

        if (result.data?.addToCart?.cart) {
          client.writeQuery({
            query: GET_CART,
            data: { cart: result.data.addToCart.cart },
          });
        }

        await client.refetchQueries({
          include: ["GetCart"],
        });
      } else {
        await unifiedAddToCart(data.productBySlug, quantity);
      }

      showNotificationWithMessage("Товар добавлен в корзину");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotificationWithMessage(
        "Не удалось добавить товар в корзину",
        "error",
      );
    } finally {
      setIsAddingToCart(false);
    }
  }, [
    data?.productBySlug,
    quantity,
    isAddingToCart,
    userData?.viewer,
    addToCart,
    client,
    unifiedAddToCart,
    showNotificationWithMessage,
  ]);

  const handleUpdateQuantity = useCallback(
    async (delta: number) => {
      if (!data?.productBySlug || isAddingToCart) return;

      const multiplicity = data.productBySlug.quantityMultiplicity || 1;
      const newQuantity = currentCartQuantity + delta * multiplicity;
      const minQuantity = multiplicity;

      if (newQuantity < minQuantity) return;

      try {
        setIsAddingToCart(true);

        if (userData?.viewer) {
          await addToCart({
            variables: {
              productId: data.productBySlug.id,
              quantity: newQuantity,
            },
          });

          await client.refetchQueries({
            include: ["GetCart"],
          });
        } else {
          await unifiedAddToCart(data.productBySlug, newQuantity);
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      data?.productBySlug,
      isAddingToCart,
      currentCartQuantity,
      userData?.viewer,
      addToCart,
      client,
      unifiedAddToCart,
    ],
  );

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

  // Извлекаем атрибуты товара, если они есть
  const productAttributes =
    (product as { attributes?: ProductAttribute[] }).attributes || [];

  const renderRegionSelection = () => {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Выберите регион:</p>
        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={currentRegion?.id || ""}
          onChange={(e) => {
            const selectedRegion = regionsData?.regions.find(
              (r: Region) => r.id === e.target.value,
            );
            if (selectedRegion) {
              localStorage.setItem(
                "selectedRegion",
                JSON.stringify(selectedRegion),
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
    <div className="bg-white">
      {/* Хлебные крошки - уменьшенный режим на мобильных */}
      <div className="container mx-auto px-4 py-3 md:py-5">
        <nav className="flex overflow-x-auto" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm whitespace-nowrap">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
                <Link
                  href="/categories"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Категории
                </Link>
              </div>
            </li>
            {product.category && (
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {product.category.title}
                  </Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
                <span className="text-gray-700 truncate max-w-[150px] md:max-w-xs font-medium">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative mb-12">
          {/* Галерея изображений - теперь отдельный компонент */}
          <div className="lg:sticky lg:top-4 self-start">
            <ProductImageGallery
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Информация о товаре */}
          <div className="flex flex-col">
            {/* Заголовок и артикул */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {product.sku && (
                  <div className="flex items-center">
                    <span>Артикул: </span>
                    <span className="ml-1 font-medium">{product.sku}</span>
                  </div>
                )}

                {product.category && (
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {product.category.title}
                  </Link>
                )}

                {/* Регион */}
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>
                    {currentRegion?.name ||
                      regionData?.viewer?.region?.name ||
                      "Не выбран"}
                  </span>
                  <button
                    className="ml-1 text-blue-600 underline hover:text-blue-800"
                    onClick={() => setShowRegionModal(!showRegionModal)}
                  >
                    Изменить
                  </button>
                </div>
              </div>

              {showRegionModal && renderRegionSelection()}
            </div>

            {/* Цена и статус наличия */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
              <div className="flex flex-wrap items-end gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </span>

                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-500 line-through">
                      {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: "RUB",
                        maximumFractionDigits: 0,
                      }).format(product.oldPrice)}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      -
                      {Math.round((1 - product.price / product.oldPrice) * 100)}
                      %
                    </span>
                  </div>
                )}
              </div>

              {/* Статус наличия */}
              {!notAvailableInRegion ? (
                <div className="flex items-center mb-4">
                  <div className="flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">В наличии</span>
                  </div>
                  {product.stock > 0 && (
                    <span className="ml-3 text-sm text-gray-600">
                      Осталось: {product.stock} {product.unit || "шт"}
                    </span>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="font-medium">Нет в наличии</span>
                  </div>

                  {product.stockAvailabilityStatus ===
                    ProductStockAvailabilityStatus.IN_STOCK_SOON && (
                    <div className="mt-2 text-sm text-yellow-700 flex items-center">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></div>
                      <span>Ожидается поступление (1-2 недели)</span>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                    <p className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1.5 text-blue-600" />
                      Проверьте наличие в других регионах или
                      <button
                        onClick={() => setShowRegionModal(true)}
                        className="ml-1 font-medium underline hover:text-blue-700"
                      >
                        выберите регион
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Количество и добавление в корзину */}
              <div className="flex items-center space-x-4">
                {currentCartQuantity > 0 ? (
                  <div className="flex items-center border rounded-md overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => handleUpdateQuantity(-1)}
                      disabled={
                        currentCartQuantity <=
                        (data?.productBySlug?.quantityMultiplicity || 1)
                      }
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <div className="w-12 text-center font-medium">
                      {currentCartQuantity}
                    </div>
                    <button
                      onClick={() => handleUpdateQuantity(1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || notAvailableInRegion}
                    className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors ${
                      isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Добавление...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        Добавить в корзину
                      </div>
                    )}
                  </button>
                )}
              </div>

              {/* Информация о шаге, если он больше 1 */}
              {product.quantityMultiplicity &&
                product.quantityMultiplicity > 1 && (
                  <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                    <span className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1.5 shrink-0" />
                      Товар продается упаковками по{" "}
                      {product.quantityMultiplicity} шт.
                    </span>
                  </div>
                )}
            </div>

            {/* Блок с преимуществами */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
                <TruckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    Быстрая доставка
                  </h3>
                  <p className="text-xs text-gray-500">
                    От 1 дня по всей России
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    Гарантия качества
                  </h3>
                  <p className="text-xs text-gray-500">На все товары</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
                <CurrencyRupeeIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    Удобная оплата
                  </h3>
                  <p className="text-xs text-gray-500">
                    Онлайн или при получении
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
                <ArrowsPointingOutIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    Возврат товара
                  </h3>
                  <p className="text-xs text-gray-500">В течение 14 дней</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Вкладки с информацией */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex overflow-x-auto border-b border-gray-200">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "description"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Описание
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "specs"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Характеристики
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "delivery"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Доставка и оплата
            </button>
          </div>

          {/* Содержимое вкладок */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose prose-blue max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {activeTab === "specs" && (
              <div>
                {productAttributes && productAttributes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productAttributes.map(
                      (attr: ProductAttribute, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between py-3 border-b border-gray-100 even:bg-gray-50 px-3 rounded-lg"
                        >
                          <span className="text-gray-600">{attr.name}</span>
                          <span className="font-medium text-gray-900">
                            {attr.value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p>Характеристики не указаны</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Доставка
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
                    <div className="flex items-start">
                      <TruckIcon className="h-5 w-5 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <p className="mb-2">
                          Мы осуществляем доставку по всей России. Сроки
                          доставки зависят от вашего региона и обычно составляют
                          от 1 до 7 рабочих дней.
                        </p>
                        <p>
                          <span className="font-medium">Текущий регион:</span>{" "}
                          {currentRegion?.name ||
                            regionData?.viewer?.region?.name ||
                            "Не выбран"}
                          <button
                            onClick={() => setShowRegionModal(true)}
                            className="ml-2 underline hover:text-blue-600"
                          >
                            Изменить
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Оплата
                  </h3>
                  <p className="mb-3 text-gray-600">
                    Доступны следующие способы оплаты:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Оплата онлайн картой на сайте</span>
                    </li>
                    <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Оплата наличными или картой при получении</span>
                    </li>
                    <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>
                        Оплата по безналичному расчету (для юридических лиц)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "Липкая" панель покупки для мобильных устройств */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-3 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: "RUB",
                maximumFractionDigits: 0,
              }).format(product.price)}
            </span>
          </div>
          {currentCartQuantity > 0 ? (
            <QuantityCounter
              quantity={currentCartQuantity}
              minQuantity={product.quantityMultiplicity || 1}
              onIncrement={() => handleUpdateQuantity(1)}
              onDecrement={() => handleUpdateQuantity(-1)}
              isLoading={isAddingToCart}
              className="flex-1"
            />
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || notAvailableInRegion}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-base transition-all ${
                notAvailableInRegion
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-sm"
              }`}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Добавление...
                </span>
              ) : notAvailableInRegion ? (
                "Нет в наличии"
              ) : (
                <span className="flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />В корзину
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Всплывающее уведомление о добавлении в корзину */}
      {showAddedNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm py-2 px-4 rounded-lg z-50 shadow-lg flex items-center space-x-2 animate-fadeIn">
          <CheckIcon className="h-5 w-5" />
          <span>Товар добавлен в корзину</span>
        </div>
      )}

      {/* Добавляем блок с похожими товарами в конец страницы */}
      {data?.productBySlug && (
        <SimilarProducts currentProduct={data.productBySlug} />
      )}

      {/* Блок с недавно просмотренными товарами */}
      {data?.productBySlug && (
        <RecentlyViewed excludeProductId={data.productBySlug.id} />
      )}

      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
