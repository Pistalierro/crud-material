import {ProductCategory} from '../constants/products-constants';

export interface ProductFilters {
  search: string;
  category: ProductCategory | 'all';
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'name' | 'brand' | 'price';
  sortDir: 'asc' | 'desc';
}
