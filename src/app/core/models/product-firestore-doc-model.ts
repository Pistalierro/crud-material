import {ProductCategory} from '../constants/products-constants';

export interface ProductFirestoreDoc {
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  description: string;
}
