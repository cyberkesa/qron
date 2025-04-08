export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: ProductImage[];
  slug: string;
  category?: { id: string; title: string; slug: string };
  stockAvailabilityStatus: "IN_STOCK" | "OUT_OF_STOCK" | "COMING_SOON";
}

export interface ProductEdge {
  node: Product;
  cursor: string;
}

export interface ProductConnection {
  edges: ProductEdge[];
  pageInfo: { hasNextPage: boolean; endCursor: string };
}

export interface ProductsData {
  products: ProductConnection;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  products: ProductConnection;
  children?: Category[];
}

export interface RootCategory extends Category {
  children: Category[];
}

export interface RootBranchCategory extends Category {
  children: Category[];
}

export interface RootLeafCategory extends Category {
  children: never[];
}
