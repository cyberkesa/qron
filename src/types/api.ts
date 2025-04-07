export type ProductSortOrder =
    'ALPHABETICALLY'|'CHEAPEST_FIRST'|'EXPENSIVE_FIRST'|'NEWEST_FIRST';

export enum ProductStockAvailabilityStatus {
  IN_STOCK = 'IN_STOCK',
  IN_STOCK_SOON = 'IN_STOCK_SOON',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  iconUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: ProductImage[];
  slug: string;
  category: Category;
  stockAvailabilityStatus: ProductStockAvailabilityStatus;
  rating?: number;
  reviewCount?: number;
  quantityMultiplicity?: number;
}

export interface Region {
  id: string;
  name: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface CartItemEdge {
  node: CartItem;
}

export interface CartItemConnection {
  edges: CartItemEdge[];
  decimalTotalPrice: string;
}

export interface CartTotal {
  amount: string;
}

export interface Cart {
  id: string;
  items: CartItemConnection;
}

export interface ProductsResponse {
  products: {
    edges: {cursor: string; node: Product;}[];
    pageInfo: {hasNextPage: boolean; endCursor: string;};
  };
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CartResponse {
  cart: Cart;
}

export interface ProductResponse {
  product: Product;
}

export interface DeliveryAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH'
}

export enum DeliveryMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY'
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  decimalUnitPrice: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  items: OrderItem[];
  decimalTotalPrice: string;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
}

export interface OrdersResponse {
  orders: {
    edges: {cursor: string; node: Order;}[];
    pageInfo: {hasNextPage: boolean; endCursor: string;};
  };
}

export interface OrderResponse {
  order: Order;
}

export interface CheckoutInput {
  deliveryAddressId: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
}

export interface CheckoutResponse {
  order: Order;
}

export interface CreateAddressInput {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  deliveryAddress: DeliveryAddress;
}