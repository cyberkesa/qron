import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBagIcon,
  ArrowRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { QuantityCounter } from "./QuantityCounter";
import { useCartContext } from "@/lib/providers/CartProvider";

export function Cart() {
  const { cart, isLoading, updateQuantity, removeFromCart } = useCartContext();

  // Показываем индикатор загрузки, пока данные корзины не загружены
  if (isLoading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600">Загрузка корзины...</p>
      </div>
    );
  }

  // Если корзина пуста
  if (cart.isEmpty) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <ShoppingBagIcon className="h-24 w-24 text-gray-300" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Корзина пуста
        </h2>
        <p className="text-gray-600 mb-6">
          Добавьте товары в корзину, чтобы сделать заказ
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
        >
          Перейти к каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
        <p className="text-gray-600 mt-1">
          Товаров в корзине: {cart.totalItems}
        </p>
      </div>

      {/* Заголовок таблицы товаров */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b font-medium text-gray-700">
        <div className="col-span-6">Товар</div>
        <div className="col-span-2 text-center">Цена</div>
        <div className="col-span-2 text-center">Количество</div>
        <div className="col-span-2 text-end">Сумма</div>
      </div>

      <div className="divide-y">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="grid md:grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-all duration-300"
          >
            {/* Изображение и информация о товаре */}
            <div className="md:col-span-6 flex space-x-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <Link href={`/product/${item.product.slug}`}>
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-contain rounded-md border border-gray-200"
                  />
                </Link>
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                  {item.product.category && item.product.category.title}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromCart(item.product.id);
                  }}
                  className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  <span>Удалить</span>
                </button>
              </div>
            </div>

            {/* Цена */}
            <div className="md:col-span-2 flex md:justify-center items-center">
              <div className="md:hidden text-sm font-medium text-gray-500 mr-2">
                Цена:
              </div>
              <div className="font-medium">
                {new Intl.NumberFormat("ru-RU").format(item.product.price)} ₽
              </div>
            </div>

            {/* Количество */}
            <div className="md:col-span-2 flex md:justify-center items-center">
              <div className="md:hidden text-sm font-medium text-gray-500 mr-2">
                Кол-во:
              </div>
              <div className="flex flex-col items-center">
                <QuantityCounter
                  quantity={item.quantity}
                  minQuantity={item.product.quantityMultiplicity || 1}
                  onIncrement={() =>
                    updateQuantity(
                      item.product.id,
                      item.quantity + (item.product.quantityMultiplicity || 1)
                    )
                  }
                  onDecrement={() =>
                    updateQuantity(
                      item.product.id,
                      item.quantity - (item.product.quantityMultiplicity || 1)
                    )
                  }
                />
                {item.product.quantityMultiplicity &&
                  item.product.quantityMultiplicity > 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Упаковка: {item.product.quantityMultiplicity} шт.
                    </div>
                  )}
              </div>
            </div>

            {/* Итоговая цена */}
            <div className="md:col-span-2 flex md:justify-end items-center">
              <div className="md:hidden text-sm font-medium text-gray-500 mr-2">
                Сумма:
              </div>
              <div className="font-bold text-lg text-gray-900">
                {new Intl.NumberFormat("ru-RU", {
                  maximumFractionDigits: 0,
                }).format(item.product.price * item.quantity)}{" "}
                ₽
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 border-t">
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-600 text-lg">Итого к оплате:</div>
          <div className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat("ru-RU", {
              maximumFractionDigits: 0,
            }).format(cart.totalPrice)}{" "}
            ₽
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-center flex items-center justify-center"
          >
            <span>Продолжить покупки</span>
          </Link>
          <Link
            href="/checkout"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center"
          >
            <span>Оформить заказ</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
