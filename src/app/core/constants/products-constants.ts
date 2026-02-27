import {Product} from '../models/product.model';

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];
export const PRODUCT_CATEGORIES = [
  {value: 'computers', label: 'Компьютеры'},
  {value: 'mobiles', label: 'Мобильные телефоны'},
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

export const PRODUCT_CATEGORY_LABEL_MAP: Record<ProductCategory, string> =
  PRODUCT_CATEGORIES.reduce(
    (acc, item) => {
      acc[item.value] = item.label;
      return acc;
    },
    {} as Record<ProductCategory, string>,
  );

