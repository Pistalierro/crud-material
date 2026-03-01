import {ProductListItem} from '../models/product.model';

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];
export const PRODUCT_CATEGORIES = [
  {value: 'computers', label: 'Комп\'ютери'},
  {value: 'mobiles', label: 'Мобільні телефони'},
  {value: 'tablets', label: 'Планшети'},
  {value: 'monitors', label: 'Монітори'},
  {value: 'laptops', label: 'Ноутбуки'},
  {value: 'servers', label: 'Сервери'},
  {value: 'office-equipment', label: 'Оргтехніка'},
] as const;

export type ProductConditionsType = 'Новый' | 'Б/у' | 'После ремонта';
export const PRODUCT_CONDITIONS: ProductConditionsType[] = ['Новый', 'Б/у', 'После ремонта'];

export const PRODUCT_CONDITION_LABEL_MAP: Record<ProductConditionsType, string> = {
  'Новый': 'Новий',
  'Б/у': 'Вживаний',
  'После ремонта': 'Після ремонту',
};

export const PRODUCT_TABLE_COLUMNS: Array<keyof ProductListItem | 'actions'> = [
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
