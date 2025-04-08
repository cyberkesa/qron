import { Product } from "@/types/api";
import React from "react";
import { ProductCard } from "../product/ProductCard";
import { useViewHistory } from "@/lib/hooks/useViewHistory";
import { useEffect, useState, useMemo } from "react";

interface SimilarProductsProps {
  currentProduct: Product;
}

export function SimilarProducts({ currentProduct }: SimilarProductsProps) {
  const { getSimilarProducts } = useViewHistory();

  // Используем useMemo вместо useState + useEffect для получения похожих товаров
  const similarProducts = useMemo(() => {
    if (!currentProduct || !currentProduct.id) {
      return [];
    }
    return getSimilarProducts(currentProduct);
  }, [currentProduct, getSimilarProducts]);

  // Если нет похожих товаров, ничего не рендерим
  if (similarProducts.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarProducts.map((product, index) => (
          <ProductCard
            key={`similar-${product.id}-${index}`}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
