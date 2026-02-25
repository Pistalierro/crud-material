import {ProductCategory} from '../constants/products-constants';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
}
