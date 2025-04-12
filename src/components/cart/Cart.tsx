import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  ArrowRightIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM_QUANTITY,
} from '@/lib/queries';
import { CartItemUnified } from '@/lib/hooks/useCart';
import { useCartContext } from '@/lib/providers/CartProvider';
import { QuantityCounter } from '@/components/ui/QuantityCounter';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export function Cart() {
  const { cart, isLoading, updateQuantity, removeFromCart, clearCart, error } =
    useCartContext();

  // State for confirmation dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);
  const [
    isRemoveAllUnavailableDialogOpen,
    setIsRemoveAllUnavailableDialogOpen,
  ] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Локальное состояние для отслеживания операций
  const [isRemoving, setIsRemoving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Разделяем товары на обычные и проблемные (нет в наличии или с нулевой ценой)
  const { validItems, problematicItems } = useMemo(() => {
    const valid: CartItemUnified[] = [];
    const problematic: CartItemUnified[] = [];

    cart.items.forEach((item) => {
      if (
        item.product.stockAvailabilityStatus === 'OUT_OF_STOCK' ||
        item.product.price <= 0
      ) {
        problematic.push(item);
      } else {
        valid.push(item);
      }
    });

    return { validItems: valid, problematicItems: problematic };
  }, [cart.items]);

  // Подсчет общей суммы только для доступных товаров
  const validItemsTotal = useMemo(() => {
    return validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [validItems]);

  // Handler for opening the delete item confirmation dialog
  const handleDeleteItem = (productId: string) => {
    setItemToDelete(productId);
    setIsDeleteDialogOpen(true);
    // Сбрасываем ошибку при новой операции
    setOperationError(null);
  };

  // Handler for confirming item deletion
  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        setIsRemoving(true);
        await removeFromCart(itemToDelete);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error when removing item:', error);
        setOperationError(
          'Не удалось удалить товар. Попробуйте еще раз позже.'
        );
      } finally {
        setIsRemoving(false);
      }
    }
  };

  // Handler for confirming cart clearing
  const confirmClearCart = async () => {
    try {
      setIsClearing(true);
      await clearCart();
    } catch (error) {
      console.error('Error when clearing cart:', error);
      setOperationError(
        'Не удалось очистить корзину. Попробуйте еще раз позже.'
      );
    } finally {
      setIsClearing(false);
    }
  };

  // Handler for removing all problematic items
  const handleRemoveAllProblematicItems = () => {
    setIsRemoveAllUnavailableDialogOpen(true);
    setOperationError(null);
  };

  // Removal of all problematic items after confirmation
  const confirmRemoveAllProblematicItems = async () => {
    try {
      setIsRemoving(true);

      // Последовательно удаляем все проблемные товары
      for (const item of problematicItems) {
        await removeFromCart(item.product.id);
        // Небольшая задержка между удалениями
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Показываем уведомление об успешном удалении
      // (уведомления об отдельных товарах будут показаны в removeFromCart)
    } catch (error) {
      console.error('Error removing problematic items:', error);
      setOperationError(
        'Не удалось удалить все недоступные товары. Попробуйте еще раз позже.'
      );
    } finally {
      setIsRemoving(false);
      setIsRemoveAllUnavailableDialogOpen(false);
    }
  };

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

  const CartItem = ({
    item,
    isProblematic = false,
  }: {
    item: CartItemUnified;
    isProblematic?: boolean;
  }) => (
    <div
      key={item.id}
      className={`px-4 py-4 transition-all duration-300 ${
        isProblematic
          ? 'bg-red-50 border-l-4 border-red-400'
          : 'border-b last:border-0 hover:bg-gray-50'
      }`}
    >
      <div className="flex gap-3 md:gap-4">
        {/* Изображение товара */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <Link href={`/product/${item.product.slug}`}>
            <Image
              src={item.product.images[0].url}
              alt={item.product.name}
              fill
              className={`object-contain rounded-md border ${isProblematic ? 'border-red-200 opacity-60' : 'border-gray-200'}`}
            />
          </Link>
        </div>

        {/* Информация о товаре и управление */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.product.slug}`}
                className={`font-medium hover:text-blue-600 transition-colors line-clamp-2 ${
                  isProblematic ? 'text-red-700' : 'text-gray-900'
                }`}
              >
                {item.product.name}
              </Link>
              <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                {item.product.category && item.product.category.title}
              </p>
            </div>
            <div className="ml-2 font-bold text-right">
              {new Intl.NumberFormat('ru-RU').format(
                item.product.price * item.quantity
              )}{' '}
              ₽
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {new Intl.NumberFormat('ru-RU').format(item.product.price)} ₽{' '}
                <span className="text-xs text-gray-500">× {item.quantity}</span>
              </div>

              {isProblematic && (
                <div className="flex items-center text-xs text-red-600">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {item.product.stockAvailabilityStatus === 'OUT_OF_STOCK'
                      ? 'Нет в наличии'
                      : 'Недоступен'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isProblematic && (
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
                  disabled={isProblematic}
                  small={true}
                />
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteItem(item.product.id);
                }}
                className="p-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                disabled={isRemoving && itemToDelete === item.product.id}
                aria-label="Удалить товар"
              >
                {isRemoving && itemToDelete === item.product.id ? (
                  <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Отображение ошибок */}
      {(operationError || error) && (
        <div className="lg:col-span-12 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {operationError ||
                  'Произошла ошибка при работе с корзиной. Попробуйте позже.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Левая колонка - список товаров */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
                <p className="text-gray-600 mt-1">
                  Товаров в корзине: {cart.totalItems}
                </p>
              </div>
              <button
                onClick={() => setIsClearCartDialogOpen(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center"
                disabled={isClearing}
              >
                {isClearing ? (
                  <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <TrashIcon className="h-4 w-4 mr-2" />
                )}
                Очистить корзину
              </button>
            </div>
          </div>

          {/* Проблемные товары */}
          {problematicItems.length > 0 && (
            <div className="mb-2">
              <div className="bg-red-50 px-6 py-3 border-y border-red-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                    <h3 className="font-medium text-red-800">
                      Товары, недоступные для заказа ({problematicItems.length})
                    </h3>
                  </div>

                  {/* Кнопка удаления всех недоступных товаров */}
                  <button
                    onClick={handleRemoveAllProblematicItems}
                    disabled={isRemoving}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors shadow-sm"
                  >
                    {isRemoving ? (
                      <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">
                      Удалить все недоступные
                    </span>
                    <span className="sm:hidden">Удалить все</span>
                  </button>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Следующие товары недоступны для заказа. Рекомендуем удалить их
                  из корзины перед оформлением заказа.
                </p>
              </div>
              <div>
                {problematicItems.map((item) => (
                  <CartItem key={item.id} item={item} isProblematic={true} />
                ))}
              </div>
            </div>
          )}

          {/* Доступные товары */}
          <div>
            {validItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>Продолжить покупки</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Правая колонка - оформление заказа */}
      <div className="lg:col-span-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">
              Оформление заказа
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Товары ({validItems.length}):
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('ru-RU').format(validItemsTotal)} ₽
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">Бесплатно</span>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">
                    Итого:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat('ru-RU').format(validItemsTotal)} ₽
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className={`w-full py-4 rounded-md text-center font-medium flex items-center justify-center mt-4 ${
                  problematicItems.length > 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white transition-colors'
                }`}
                onClick={(e) =>
                  problematicItems.length > 0 && e.preventDefault()
                }
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                <span>Оформить заказ</span>
              </Link>

              {problematicItems.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-md">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      Для оформления заказа необходимо удалить недоступные
                      товары из корзины
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <span>Безопасная оплата онлайн</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TruckIcon className="h-5 w-5 text-green-600" />
                  <span>Быстрая доставка</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete item confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteItem}
        title="Удаление товара"
        message="Вы уверены, что хотите удалить этот товар из корзины?"
        confirmText="Удалить"
        cancelText="Отмена"
        isDanger={true}
      />

      {/* Clear cart confirmation dialog */}
      <ConfirmationDialog
        isOpen={isClearCartDialogOpen}
        onClose={() => setIsClearCartDialogOpen(false)}
        onConfirm={confirmClearCart}
        title="Очистка корзины"
        message="Вы уверены, что хотите удалить все товары из корзины? Это действие нельзя будет отменить."
        confirmText="Очистить корзину"
        cancelText="Отмена"
        isDanger={true}
      />

      {/* Remove all unavailable items confirmation dialog */}
      <ConfirmationDialog
        isOpen={isRemoveAllUnavailableDialogOpen}
        onClose={() => setIsRemoveAllUnavailableDialogOpen(false)}
        onConfirm={confirmRemoveAllProblematicItems}
        title="Удаление недоступных товаров"
        message="Вы уверены, что хотите удалить все недоступные для заказа товары из корзины?"
        confirmText="Удалить все недоступные"
        cancelText="Отмена"
        isDanger={true}
      />
    </div>
  );
}
