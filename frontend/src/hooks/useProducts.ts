import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { ExtractionCategory } from '../types';

export const useProducts = (category: ExtractionCategory | 'all' = 'all') => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: () => productService.getAllProducts(category),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProductBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug || ''),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
