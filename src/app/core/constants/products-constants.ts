import {Product} from '../models/product.model';

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];
export const PRODUCT_CATEGORIES = [
  {value: 'computers', label: 'Компьютеры'},
  {value: 'tablets', label: 'Планшеты'},
  {value: 'monitors', label: 'Мониторы'},
  {value: 'laptops', label: 'Ноутбуки'},
  {value: 'servers', label: 'Серверы'},
  {value: 'office-equipment', label: 'Оргтехника'},
] as const;


export type ProductConditionsType = 'Новый' | 'Б/у' | 'После ремонта'
export const PRODUCT_CONDITIONS: ProductConditionsType[] = ['Новый', 'Б/у', 'После ремонта'];

export const PRODUCT_TABLE_COLUMNS: Array<keyof Product | 'actions'> = [
  'name',
  'category',
  'condition',
  'startDate',
  'price',
  'description',
  'actions'
];

