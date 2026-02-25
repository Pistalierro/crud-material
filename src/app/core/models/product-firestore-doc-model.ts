import {ProductCategory} from '../constants/products-constants';

export interface ProductFirestoreDoc {
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
}
