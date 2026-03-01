import {ProductCategory, ProductConditionsType} from '../constants/products-constants';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  condition: ProductConditionsType;
  startDate: Date;
  description: string;
}

export type ProductSource = 'public' | 'sandbox';

export interface ProductListItem extends Product {
  source: ProductSource;
  ownerUid: string | null;
}

