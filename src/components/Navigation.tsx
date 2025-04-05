import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_CART } from "@/lib/queries";

export function Navigation() {
  const { data } = useQuery(GET_CART);
  const cartItemsCount = data?.cart?.items?.length || 0;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            KRON
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Товары
            </Link>
            <Link
              href="/cart"
              className="text-gray-600 hover:text-gray-900 relative"
            >
              Корзина
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
