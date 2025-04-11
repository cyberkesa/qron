"use client";

import { useState, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductStockAvailabilityStatus, Category } from "@/types/api";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_TO_CART, GET_VIEWER, GET_CART } from "@/lib/queries";
import { useApolloClient } from "@apollo/client";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCartContext } from "@/lib/providers/CartProvider";
import { CartItemUnified } from "@/lib/hooks/useCart";
import { QuantityCounter } from "@/components/ui/QuantityCounter";
import { Notification } from "@/components/ui/Notification";
import useCachedImages from "@/lib/hooks/useCachedImages";
import { trackEvent } from "@/lib/analytics";
import React from "react";

// Вспомогательная функция для отображения пути категории
const formatCategoryPath = (category: Category) => {
  if (!category) return "";

  let path = category.title;

  // Если это NonRootLeafCategory и есть предки или родитель
  if (category.__typename === "NonRootLeafCategory") {
    // Если есть предки
    if (category.ancestors && category.ancestors.length > 0) {
      // Показываем только последнего предка для компактности
      const lastAncestor = category.ancestors[category.ancestors.length - 1];
      path = `${lastAncestor.title} / ${path}`;
    }
    // Иначе используем родителя, если он есть
    else if (category.parent) {
      path = `${category.parent.title} / ${path}`;
    }
  }

  return path;
};

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => Promise<void>;
}

// Оптимизированный компонент ProductCard
function ProductCardBase({ product, onAddToCart }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Собираем все URL изображений для предзагрузки
  const imageUrls = useMemo(() => {
    if (!product.images || !product.images.length) return [];
    return product.images.map((img) => img.url);
  }, [product.images]);

  // Используем наш хук для кэширования изображений
  const { loadingStates } = useCachedImages(imageUrls, {
    placeholder: "/images/product-placeholder.png",
  });

  // Apollo Client для обновления кэша после добавления в корзину
  const { cart: unifiedCart, addToCart: addToUnifiedCart } = useCartContext();
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const { data: userData } = useQuery(GET_VIEWER);
  const apolloClient = useApolloClient();

  // Получаем текущее количество товара в корзине
  const currentCartQuantity = useMemo(() => {
    if (!unifiedCart || !unifiedCart.items) return 0;

    const cartItem = unifiedCart.items.find(
      (item: CartItemUnified) => item.product?.id === product.id,
    );

    return cartItem ? cartItem.quantity : 0;
  }, [unifiedCart, product.id]);

  // Получаем уведомление о статусе товара (в наличии/нет в наличии)
  const getStockStatusBadge = useCallback(() => {
    switch (product.stockAvailabilityStatus) {
      case ProductStockAvailabilityStatus.OUT_OF_STOCK:
        return (
          <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
            Нет в наличии
          </div>
        );
      case ProductStockAvailabilityStatus.IN_STOCK_SOON:
        return (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
            Скоро в наличии
          </div>
        );
      default:
        return null;
    }
  }, [product.stockAvailabilityStatus]);

  // Ручная обертка над добавлением в корзину
  const handleUpdateQuantity = useCallback(
    async (delta: number) => {
      try {
        setIsAddingToCart(true);

        // Если функция onAddToCart передана извне, используем ее
        if (onAddToCart && delta > 0 && currentCartQuantity === 0) {
          await onAddToCart(product);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
          return;
        }

        // Если не передан внешний обработчик или это изменение количества, используем универсальную логику
        const newQuantity = Math.max(
          0,
          currentCartQuantity + delta * (product.quantityMultiplicity || 1),
        );

        // Используем addToUnifiedCart из контекста корзины
        await addToUnifiedCart(product, newQuantity);

        // Если это первая позиция (добавление, а не изменение), показываем уведомление
        if (delta > 0 && currentCartQuantity === 0) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
        }

        // Аналитика добавления товара
        if (delta > 0 && currentCartQuantity === 0) {
          trackEvent("add_to_cart", {
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
          });
        }
      } catch (error) {
        console.error("Error updating cart quantity:", error);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [product, currentCartQuantity, addToUnifiedCart, onAddToCart],
  );

  // Форматирование цены - мемоизировано для предотвращения лишних рендеров
  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(product.price),
    [product.price],
  );

  // Форматированная старая цена - тоже мемоизирована
  const formattedOldPrice = useMemo(
    () =>
      product.decimalPrice
        ? new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
          }).format(parseFloat(product.decimalPrice))
        : null,
    [product.decimalPrice],
  );

  // Вычисляем процент скидки
  const discountPercentage = useMemo(() => {
    if (!product.decimalPrice) return null;
    const oldPrice = parseFloat(product.decimalPrice);
    if (oldPrice <= product.price) return null;
    return Math.round(100 - (product.price / oldPrice) * 100);
  }, [product.price, product.decimalPrice]);

  const isOutOfStock =
    product.stockAvailabilityStatus ===
    ProductStockAvailabilityStatus.OUT_OF_STOCK;

  // Стили для карточки на основе доступности товара
  const cardClassName = useMemo(() => {
    const baseClasses =
      "group rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full flex flex-col product-card hover:border-blue-200";

    if (isOutOfStock) {
      return `${baseClasses} bg-gray-50 opacity-80`;
    }

    return `${baseClasses} bg-white`;
  }, [isOutOfStock]);

  const contentClassName = useMemo(() => {
    const baseClasses = "p-4 flex flex-col flex-grow z-10";

    if (isOutOfStock) {
      return `${baseClasses} bg-gray-50`;
    }

    return `${baseClasses} bg-white`;
  }, [isOutOfStock]);

  const titleClassName = useMemo(() => {
    const baseClasses =
      "text-base font-medium line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors";

    if (isOutOfStock) {
      return `${baseClasses} text-gray-600`;
    }

    return `${baseClasses} text-gray-800`;
  }, [isOutOfStock]);

  const priceClassName = useMemo(() => {
    const baseClasses = "text-lg font-semibold";

    if (isOutOfStock) {
      return `${baseClasses} text-gray-600`;
    }

    return `${baseClasses} text-gray-900`;
  }, [isOutOfStock]);

  return (
    <div
      className={cardClassName}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {getStockStatusBadge()}

      {discountPercentage && discountPercentage > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10 animate-pulse shadow-sm">
          Скидка {discountPercentage}%
        </span>
      )}

      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-48 overflow-hidden relative flex items-center justify-center p-4 bg-white product-card-image group">
          {product.images && product.images.length > 0 ? (
            <>
              {product.images.length > 1 ? (
                // When we have multiple images, set up image switching on hover
                <>
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    className={`object-contain w-full h-full transition-opacity duration-300 ${
                      isOutOfStock ? "filter grayscale opacity-70" : ""
                    } ${isHovering ? "opacity-0" : "opacity-100"} absolute inset-0`}
                    width={200}
                    height={200}
                    priority={false}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src =
                        "/images/product-placeholder.png";
                    }}
                  />
                  <Image
                    src={product.images[1].url}
                    alt={`${product.name} - изображение 2`}
                    className={`object-contain w-full h-full transition-opacity duration-300 ${
                      isOutOfStock ? "filter grayscale opacity-70" : ""
                    } ${isHovering ? "opacity-100" : "opacity-0"} absolute inset-0`}
                    width={200}
                    height={200}
                    priority={false}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src =
                        "/images/product-placeholder.png";
                    }}
                  />
                </>
              ) : (
                // Single image case
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  className={`object-contain w-full h-full transition-transform duration-300 group-hover:scale-110 ${
                    isOutOfStock ? "filter grayscale opacity-70" : ""
                  }`}
                  width={200}
                  height={200}
                  priority={false}
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src =
                      "/images/product-placeholder.png";
                  }}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
              <span className="text-gray-400 text-sm">Нет изображения</span>
            </div>
          )}

          {/* Quick view indicator with image count */}
          {product.images && product.images.length > 1 && (
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-50 to-transparent p-2 transition-opacity text-center ${
                isHovering ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                {product.images.slice(0, 4).map((_, index) => (
                  <span
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === (isHovering ? 1 : 0) ? "bg-blue-600" : "bg-blue-300"}`}
                  ></span>
                ))}
                {product.images.length > 4 && (
                  <span className="text-xs text-blue-700">
                    +{product.images.length - 4}
                  </span>
                )}
              </div>
              <span className="text-xs text-blue-700 font-medium mt-0.5 inline-block">
                {product.images.length} фото
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className={contentClassName}>
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors mb-1 inline-block hover-bright"
            onClick={(e) => e.stopPropagation()}
          >
            {formatCategoryPath(product.category)}
          </Link>
        )}

        <Link href={`/product/${product.slug}`} className="flex-grow">
          <h3 className={titleClassName}>{product.name}</h3>
        </Link>

        {product.quantityMultiplicity && product.quantityMultiplicity > 1 && (
          <div className="mt-1 text-xs text-gray-500">
            Продается по {product.quantityMultiplicity} шт
          </div>
        )}

        {product.sku && (
          <div className="mt-1 text-xs text-gray-500">
            Артикул: {product.sku}
          </div>
        )}

        <div className="mt-auto">
          <div className="flex justify-between items-end mt-2">
            <div>
              {formattedOldPrice && (
                <div className="text-xs text-gray-500 line-through">
                  {formattedOldPrice}
                </div>
              )}
              <div className={priceClassName}>{formattedPrice}</div>
            </div>

            {!isOutOfStock && currentCartQuantity > 0 ? (
              <QuantityCounter
                quantity={currentCartQuantity}
                minQuantity={product.quantityMultiplicity || 1}
                onIncrement={() => handleUpdateQuantity(1)}
                onDecrement={() => handleUpdateQuantity(-1)}
                isLoading={isAddingToCart}
              />
            ) : (
              <button
                onClick={() => handleUpdateQuantity(1)}
                disabled={isAddingToCart || isOutOfStock}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors btn-pulse ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                aria-label="Добавить в корзину"
              >
                {isAddingToCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCartIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showNotification && (
        <Notification
          type="success"
          message="Товар добавлен в корзину"
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
          duration={2000}
        />
      )}
    </div>
  );
}

// Мемоизируем компонент, чтобы избежать перерисовок при обновлении родительских компонентов
const ProductCard = memo(ProductCardBase);

export { ProductCard };
