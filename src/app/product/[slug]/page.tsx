'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  GET_PRODUCT,
  ADD_TO_CART,
  GET_CURRENT_REGION,
  GET_REGIONS,
  GET_VIEWER,
  GET_CART,
} from '@/lib/queries';
import { ProductStockAvailabilityStatus, Region } from '@/types/api';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useViewHistory } from '@/lib/hooks/useViewHistory';
import { SimilarProducts } from '@/components/product-list/SimilarProducts';
import { useCartContext } from '@/lib/providers/CartProvider';
import { useNotificationContext } from '@/lib/providers/NotificationProvider';
import { RecentlyViewed } from '@/components/product-list/RecentlyViewed';
import {
  Breadcrumbs,
  buildProductBreadcrumbs,
} from '@/components/ui/Breadcrumbs';
import { trackEvent } from '@/lib/analytics';

// Импортируем созданные компоненты
import ProductImageGallery, {
  ProductImage,
} from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductTabs from '@/components/product/ProductTabs';
import RegionSelector from '@/components/product/RegionSelector';

// Типы для компонента страницы продукта
interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Тип для табов
type TabType = 'description' | 'specs' | 'delivery';

interface ProductAttribute {
  name: string;
  value: string;
}

// Компонент для карточки информации
const InfoCard = ({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}
  >
    <div className="p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

// Компонент загрузки
const ProductSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="container mx-auto px-4 py-6">
      <div className="animate-pulse">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="max-w-[480px] w-full aspect-square bg-gray-200 rounded-2xl"></div>

          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Компонент страницы продукта
export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const client = useApolloClient();
  const { data: userData } = useQuery(GET_VIEWER);
  const { addToCart: unifiedAddToCart, cart: unifiedCart } = useCartContext();

  // Извлекаем slug из params напрямую без использования React.use()
  const { slug } = params;

  // Состояния компонента
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [currentRegion, setCurrentRegion] = useState<Region | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedRegion = localStorage.getItem('selectedRegion');
    return savedRegion ? JSON.parse(savedRegion) : null;
  });
  const [notAvailableInRegion, setNotAvailableInRegion] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Получаем сервис уведомлений
  const { showSuccess, showError } = useNotificationContext();

  // Получаем текущий регион при загрузке страницы
  const { data: regionData } = useQuery(GET_CURRENT_REGION);

  // Получаем данные о продукте, передавая slug из URL
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { slug: decodeURIComponent(slug) },
    fetchPolicy: 'cache-and-network',
  });

  const { data: regionsData } = useQuery(GET_REGIONS);

  const [addToCart] = useMutation(ADD_TO_CART, {
    onError: (error) => {
      console.error('Error adding to cart:', error);
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
  }, [data?.productBySlug, currentRegion]);

  useEffect(() => {
    if (data?.productBySlug) {
      addToHistory(data.productBySlug);

      // Отслеживаем просмотр товара в Яндекс.Метрике
      trackEvent('product_view', {
        product_id: data.productBySlug.id,
        product_name: data.productBySlug.name,
        product_price: data.productBySlug.price,
        product_category: data.productBySlug.category?.title || 'Без категории',
      });
    }
  }, [data?.productBySlug, addToHistory]);

  // Получаем текущее количество товара в корзине
  const getCurrentCartQuantity = useCallback(() => {
    if (!data?.productBySlug) return 0;

    if (userData?.viewer && client) {
      // Для авторизованных пользователей получаем из кэша Apollo
      const cartData = client.readQuery({ query: GET_CART });
      const cartItem = cartData?.cart?.items?.edges?.find(
        (edge: any) => edge?.node?.product?.id === data.productBySlug.id
      );
      return cartItem?.node?.quantity || 0;
    } else {
      // Для гостей получаем из унифицированной корзины
      const cartItem = unifiedCart.items.find(
        (item) => item.product.id === data.productBySlug.id
      );
      return cartItem?.quantity || 0;
    }
  }, [userData?.viewer, unifiedCart.items, client, data?.productBySlug]);

  const currentCartQuantity = useMemo(
    () => getCurrentCartQuantity(),
    [getCurrentCartQuantity]
  );

  // Функция для форматирования цены
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Добавление товара в корзину
  const handleAddToCart = useCallback(async () => {
    if (!data || !data.productBySlug || isAddingToCart) return;

    try {
      setIsAddingToCart(true);

      const quantity = data.productBySlug.quantityMultiplicity || 1;

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
          include: ['GetCart'],
        });
      } else {
        await unifiedAddToCart(data.productBySlug, quantity);
      }

      // Показываем уведомление через контекст
      showSuccess(`${data.productBySlug.name} добавлен в корзину`);
      trackEvent('product_added_to_cart', { productId: data.productBySlug.id });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Не удалось добавить товар в корзину');
    } finally {
      setIsAddingToCart(false);
    }
  }, [
    data,
    isAddingToCart,
    userData?.viewer,
    addToCart,
    client,
    unifiedAddToCart,
    showSuccess,
    showError,
  ]);

  // Добавляем или исправляем функцию обновления количества товара в корзине
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
            include: ['GetCart'],
          });
        } else {
          await unifiedAddToCart(data.productBySlug, newQuantity);
        }
      } catch (error) {
        console.error('Error updating cart:', error);
        showError('Не удалось обновить количество товара');
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
      showError,
    ]
  );

  const handleRegionSelect = useCallback((region: Region) => {
    localStorage.setItem('selectedRegion', JSON.stringify(region));
    setCurrentRegion(region);
    setShowRegionModal(false);
    window.location.reload(); // Перезагрузка для применения нового региона
  }, []);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Ошибка загрузки товара
            </h3>
            <p className="text-sm text-red-600 mb-6">{error.message}</p>
            <button
              onClick={() => router.refresh()}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-yellow-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <InformationCircleIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Товар не найден
            </h2>
            <p className="text-sm text-yellow-600 mb-6">
              К сожалению, запрашиваемый товар не существует или был удален.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = data.productBySlug;

  // Извлекаем атрибуты товара, если они есть
  const productAttributes =
    (product as { attributes?: ProductAttribute[] }).attributes || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Хлебные крошки */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={buildProductBreadcrumbs(product)} />
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 lg:gap-12 mb-8">
          {/* Галерея изображений */}
          <div className="lg:sticky top-[var(--header-height,4.5rem)] pt-safe self-start">
            <ProductImageGallery
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            <ProductInfo
              product={product}
              currentRegion={currentRegion}
              currentCartQuantity={currentCartQuantity}
              isAddingToCart={isAddingToCart}
              notAvailableInRegion={notAvailableInRegion}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRegionChange={() => setShowRegionModal(true)}
              formatPrice={formatPrice}
            />
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Описание товара */}
          {product.description && (
            <InfoCard title="Описание товара" icon={InformationCircleIcon}>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </InfoCard>
          )}

          {/* Характеристики товара */}
          {productAttributes && productAttributes.length > 0 && (
            <InfoCard title="Характеристики" icon={ChartBarIcon}>
              <div className="space-y-4">
                {productAttributes.map((attribute, index) => (
                  <div
                    key={attribute.name}
                    className={`grid grid-cols-[auto_1fr] gap-4 py-3 break-words ${
                      index !== productAttributes.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {attribute.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 text-right">
                      {attribute.value}
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      {/* Рекомендации */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Похожие товары */}
          {data?.productBySlug && (
            <div className="mb-8 lg:mb-12">
              <SimilarProducts currentProduct={data.productBySlug} />
            </div>
          )}

          {/* Недавно просмотренные */}
          {data?.productBySlug && (
            <div>
              <RecentlyViewed excludeProductId={data.productBySlug.id} />
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно выбора региона */}
      <RegionSelector
        show={showRegionModal}
        regions={regionsData?.regions || []}
        currentRegion={currentRegion}
        onRegionSelect={handleRegionSelect}
        onClose={() => setShowRegionModal(false)}
      />
    </div>
  );
}
