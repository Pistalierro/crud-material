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
