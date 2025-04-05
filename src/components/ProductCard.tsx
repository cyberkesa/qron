import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductStockAvailabilityStatus } from "@/types/api";
import { useMutation } from "@apollo/client";
import { ADD_TO_CART } from "@/lib/queries";
import { useApolloClient } from "@apollo/client";
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const client = useApolloClient();

  const [addToCart] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      setIsAddingToCart(false);
      setShowAddedNotification(true);
      setTimeout(() => setShowAddedNotification(false), 2000);
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    },
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      isAddingToCart ||
      product.stockAvailabilityStatus ===
        ProductStockAvailabilityStatus.OUT_OF_STOCK
    ) {
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCart({
        variables: {
          productId: product.id,
          quantity: 1,
        },
      });

      // Invalidate the cache for the cart query
      await client.refetchQueries({
        include: ["GetCart"],
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
    // Здесь должна быть логика добавления/удаления из избранного
  };

  const getStockStatusBadge = () => {
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
            Скоро в наличии
          </span>
        );
      case ProductStockAvailabilityStatus.OUT_OF_STOCK:
        return (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10 flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 inline-block"></span>
            Нет в наличии
          </span>
        );
      default:
        return null;
    }
  };

  // Форматирование цены
  const formattedPrice =
    typeof product.price === "number"
      ? new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "RUB",
          maximumFractionDigits: 0,
        }).format(product.price)
      : "Цена по запросу";

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl relative h-full flex flex-col">
      {getStockStatusBadge()}

      {/* Кнопка добавления в избранное */}
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300"
        aria-label={
          isInWishlist ? "Удалить из избранного" : "Добавить в избранное"
        }
      >
        {isInWishlist ? (
          <HeartIconSolid className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
        )}
      </button>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-48 overflow-hidden relative flex items-center justify-center p-4">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105 p-3"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Нет изображения</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors mb-1"
            onClick={(e) => e.stopPropagation()}
          >
            {product.category.title}
          </Link>
        )}

        <Link href={`/product/${product.slug}`} className="no-underline">
          <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Оценки товара, если есть */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount || 0} отзывов)
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                  maximumFractionDigits: 0,
                }).format(product.oldPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={
              isAddingToCart ||
              product.stockAvailabilityStatus ===
                ProductStockAvailabilityStatus.OUT_OF_STOCK
            }
            className={`p-2 rounded-full transition-colors ${
              product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.OUT_OF_STOCK
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transform transition-transform"
            }`}
            aria-label="Добавить в корзину"
          >
            {isAddingToCart ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <ShoppingCartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Всплывающее уведомление о добавлении в корзину */}
      {showAddedNotification && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs py-1 px-3 rounded-full z-20 shadow-md animate-fade-in-up">
          Добавлено в корзину
        </div>
      )}
    </div>
  );
}
