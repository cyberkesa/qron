import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductStockAvailabilityStatus } from "@/types/api";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_TO_CART, GET_VIEWER, GET_CART } from "@/lib/queries";
import { useApolloClient } from "@apollo/client";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCartContext } from "@/lib/providers/CartProvider";
import { CartItemUnified } from "@/lib/hooks/useCart";
import { QuantityCounter } from "@/components/ui/QuantityCounter";
import { Notification } from "@/components/ui/Notification";
import React from "react";

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
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10 flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 inline-block"></span>
            В наличии
          </span>
        );
      case ProductStockAvailabilityStatus.IN_STOCK_SOON:
        return (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10 flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 inline-block"></span>
            Ожидается поступление
          </span>
        );
      case ProductStockAvailabilityStatus.OUT_OF_STOCK:
        return (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 inline-block"></span>
              Нет в наличии
            </span>
            {/* <div className="mt-1 bg-white/90 border border-gray-200 shadow-sm text-xs text-gray-700 px-2 py-1 rounded-full">
              Проверьте другие регионы
            </div> */}
          </div>
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

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl relative h-full flex flex-col">
      {getStockStatusBadge()}

      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-48 overflow-hidden relative flex items-center justify-center p-4">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              className="object-contain transition-transform duration-500 group-hover:scale-110 p-3"
              width={400}
              height={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Нет изображения</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow bg-white z-10">
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors mb-1 inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            {product.category.title}
          </Link>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="no-underline group-hover:text-blue-600 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </span>
            {formattedOldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formattedOldPrice}
              </span>
            )}
            {product.quantityMultiplicity &&
              product.quantityMultiplicity > 1 && (
                <span className="text-xs text-blue-600">
                  Продается по: {product.quantityMultiplicity} шт.
                </span>
              )}
          </div>

          {currentCartQuantity > 0 ? (
            <QuantityCounter
              quantity={currentCartQuantity}
              minQuantity={product.quantityMultiplicity || 1}
              onIncrement={() => handleUpdateQuantity(1)}
              onDecrement={() => handleUpdateQuantity(-1)}
              isLoading={isAddingToCart}
            />
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpdateQuantity(1);
              }}
              disabled={isAddingToCart || isOutOfStock}
              className={`p-3 rounded-full transition-all ${
                isOutOfStock
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95 transform"
              }`}
              aria-label="Добавить в корзину"
            >
              {isAddingToCart ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <ShoppingCartIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <Notification
        message="Товар добавлен в корзину"
        type="success"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

// Оборачиваем компонент в React.memo для предотвращения ненужных ререндеров
export const ProductCard = React.memo(ProductCardBase);
