import { useState, useCallback, useMemo } from "react";
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

function ProductCardBase({ product, onAddToCart }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const client = useApolloClient();
  const { data: userData } = useQuery(GET_VIEWER);
  const { addToCart: unifiedAddToCart, cart: unifiedCart } = useCartContext();

  const [addToCart] = useMutation(ADD_TO_CART, {
    onError: (error) => {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    },
  });

  // Получаем текущее количество товара в корзине - теперь мемоизировано
  const getCurrentCartQuantity = useCallback(() => {
    if (userData?.viewer) {
      // Для авторизованных пользователей получаем из кэша
      const cartData = client.readQuery({ query: GET_CART });
      const cartItem = cartData?.cart?.items?.edges?.find(
        (edge: any) => edge.node.product.id === product.id,
      );
      return cartItem?.node?.quantity || 0;
    } else {
      // Для гостей получаем из унифицированной корзины
      const cartItem = unifiedCart.items.find(
        (item: CartItemUnified) => item.product.id === product.id,
      );
      return cartItem?.quantity || 0;
    }
  }, [userData?.viewer, client, product.id, unifiedCart.items]);

  const currentCartQuantity = useMemo(
    () => getCurrentCartQuantity(),
    [getCurrentCartQuantity],
  );

  const handleUpdateQuantity = useCallback(
    async (delta: number) => {
      const step = product.quantityMultiplicity || 1;
      const newQuantity =
        currentCartQuantity === 0 ? step : currentCartQuantity + delta * step;
      const minQuantity = step;

      if (newQuantity < minQuantity) {
        return;
      }

      try {
        setIsAddingToCart(true);

        if (userData?.viewer) {
          const result = await addToCart({
            variables: {
              productId: product.id,
              quantity: newQuantity,
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
          await unifiedAddToCart(product, newQuantity);
        }

        setShowNotification(true);
      } catch (error) {
        console.error("Error updating cart:", error);
        setShowNotification(true);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      product,
      currentCartQuantity,
      userData?.viewer,
      addToCart,
      client,
      unifiedAddToCart,
    ],
  );

  const getStockStatusBadge = useCallback(() => {
    switch (product.stockAvailabilityStatus) {
      case ProductStockAvailabilityStatus.IN_STOCK:
        return (
          <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full z-10 flex items-center animate-fade-in shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 inline-block"></span>
            В наличии
          </span>
        );
      case ProductStockAvailabilityStatus.IN_STOCK_SOON:
        return (
          <span className="absolute top-2 right-2 bg-yellow-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full z-10 flex items-center animate-fade-in shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5 inline-block"></span>
            Скоро в наличии
          </span>
        );
      case ProductStockAvailabilityStatus.OUT_OF_STOCK:
        return (
          <span className="absolute top-2 right-2 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full z-10 flex items-center animate-fade-in shadow-sm">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5 inline-block"></span>
            Нет в наличии
          </span>
        );
      default:
        return null;
    }
  }, [product.stockAvailabilityStatus]);

  // Форматирование цены - теперь мемоизировано
  const formattedPrice = useMemo(
    () =>
      typeof product.price === "number"
        ? new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
          }).format(product.price)
        : "Цена по запросу",
    [product.price],
  );

  // Форматированная старая цена - тоже мемоизирована
  const formattedOldPrice = useMemo(
    () =>
      typeof product.oldPrice === "number"
        ? new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
          }).format(product.oldPrice)
        : null,
    [product.oldPrice],
  );

  const isOutOfStock =
    product.stockAvailabilityStatus ===
    ProductStockAvailabilityStatus.OUT_OF_STOCK;

  // Стили для карточки на основе доступности товара
  const cardClassName = useMemo(() => {
    const baseClasses =
      "group rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full flex flex-col product-card";

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
    <div className={cardClassName}>
      {getStockStatusBadge()}

      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-48 overflow-hidden relative flex items-center justify-center p-4 bg-white product-card-image">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              className={`object-contain w-full h-full transition-transform duration-300 group-hover:scale-110 ${isOutOfStock ? "filter grayscale opacity-70" : ""}`}
              width={200}
              height={200}
              priority={false}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
              <span className="text-gray-400 text-sm">Нет изображения</span>
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
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
                aria-label="Добавить в корзину"
              >
                {isAddingToCart ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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

// Оборачиваем компонент в React.memo для предотвращения ненужных ререндеров
export const ProductCard = React.memo(ProductCardBase);
