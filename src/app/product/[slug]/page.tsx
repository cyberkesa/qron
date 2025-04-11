"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { ProductStockAvailabilityStatus, Region } from "@/types/api";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useViewHistory } from "@/lib/hooks/useViewHistory";
import { SimilarProducts } from "@/components/product-list/SimilarProducts";
import { useCartContext } from "@/lib/providers/CartProvider";
import { Notification } from "@/components/ui/Notification";
import { RecentlyViewed } from "@/components/product-list/RecentlyViewed";
import {
  Breadcrumbs,
  buildProductBreadcrumbs,
} from "@/components/ui/Breadcrumbs";
import { trackEvent } from "@/lib/analytics";

// Импортируем созданные компоненты
import ProductImageGallery, {
  ProductImage,
} from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import MobileAddToCart from "@/components/product/MobileAddToCart";
import RegionSelector from "@/components/product/RegionSelector";

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
  }, [data?.productBySlug, currentRegion]); // Include the full product object

  // Устанавливаем начальное количество только при первой загрузке товара
  useEffect(() => {
    if (data?.productBySlug?.quantityMultiplicity && quantity === 1) {
      setQuantity(data.productBySlug.quantityMultiplicity);
    }
  }, [data?.productBySlug?.quantityMultiplicity, quantity, setQuantity]);

  useEffect(() => {
    if (data?.productBySlug) {
      addToHistory(data.productBySlug);

      // Отслеживаем просмотр товара в Яндекс.Метрике
      trackEvent("product_view", {
        product_id: data.productBySlug.id,
        product_name: data.productBySlug.name,
        product_price: data.productBySlug.price,
        product_category: data.productBySlug.category?.title || "Без категории",
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
        (edge: any) => edge?.node?.product?.id === data.productBySlug.id,
      );
      return cartItem?.node?.quantity || 0;
    } else {
      // Для гостей получаем из унифицированной корзины
      const cartItem = unifiedCart.items.find(
        (item) => item.product.id === data.productBySlug.id,
      );
      return cartItem?.quantity || 0;
    }
  }, [userData?.viewer, unifiedCart.items, client, data?.productBySlug]);

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

  // Функция для форматирования цены
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Обработчик изменения количества
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (data?.productBySlug) {
        setQuantity(newQuantity);
      }
    },
    [data?.productBySlug],
  );

  // Добавление товара в корзину
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
      trackEvent("product_added_to_cart", { productId: data.productBySlug.id });
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
    data,
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

  const handleRegionSelect = useCallback((region: Region) => {
    localStorage.setItem("selectedRegion", JSON.stringify(region));
    setCurrentRegion(region);
    setShowRegionModal(false);
    window.location.reload(); // Перезагрузка для применения нового региона
  }, []);

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

  return (
    <div className="bg-white">
      {/* Хлебные крошки - уменьшенный режим на мобильных */}
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-5 text-sm">
        <Breadcrumbs items={buildProductBreadcrumbs(product)} />
      </div>

      <div className="container mx-auto px-3 md:px-4 pb-16 mb-16 md:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 relative mb-6 md:mb-12">
          {/* Галерея изображений */}
          <div className="lg:sticky lg:top-4 self-start">
            <ProductImageGallery
              images={productImages}
              productName={product.name}
            />
          </div>

          {/* Информация о товаре */}
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

        {/* Вкладки с информацией */}
        <ProductTabs
          description={product.description}
          attributes={productAttributes}
          currentRegion={currentRegion}
          onRegionChange={() => setShowRegionModal(true)}
        />
      </div>

      {/* "Липкая" панель покупки для мобильных устройств */}
      <MobileAddToCart
        price={product.price}
        formatPrice={formatPrice}
        currentCartQuantity={currentCartQuantity}
        isAddingToCart={isAddingToCart}
        notAvailableInRegion={notAvailableInRegion}
        quantityMultiplicity={product.quantityMultiplicity || 1}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Всплывающее уведомление о добавлении в корзину */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      {/* Блоки рекомендаций */}
      <div className="pb-24 md:pb-8">
        {" "}
        {/* Extra padding at bottom for mobile for sticky cart button */}
        {/* Блок с похожими товарами */}
        {data?.productBySlug && (
          <div className="mt-6 md:mt-12">
            <SimilarProducts currentProduct={data.productBySlug} />
          </div>
        )}
        {/* Блок с недавно просмотренными товарами */}
        {data?.productBySlug && (
          <div className="mt-6 md:mt-12">
            <RecentlyViewed excludeProductId={data.productBySlug.id} />
          </div>
        )}
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
