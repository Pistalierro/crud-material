import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  PRODUCT_CONDITION_LABEL_MAP,
  ProductCategory,
  ProductConditionsType
} from '../../../../core/constants/products-constants';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {CreateProductDto, UpdateProductDto} from '../../../../core/models/product-dto.model';
import {ProductListItem} from '../../../../core/models/product.model';

export interface ProductFormDialogData {
  product: ProductListItem;
}

export type ProductFormDialogResult =
  | { mode: 'create'; payload: CreateProductDto }
  | {
  mode: 'edit';
  id: string;
  payload: UpdateProductDto;
  source: ProductListItem['source'];
  ownerUid: ProductListItem['ownerUid'];
};

@Component({
  selector: 'app-product-form-dialog',
  imports: [
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    MatDialogContent,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    ReactiveFormsModule
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrl: './product-form-dialog.component.scss',
})
export class ProductFormDialogComponent {

  readonly categories = PRODUCT_CATEGORIES;
  readonly productConditions: ProductConditionsType[] = PRODUCT_CONDITIONS;
  readonly conditionLabelMap = PRODUCT_CONDITION_LABEL_MAP;
  readonly dialogData = inject<ProductFormDialogData | null>(MAT_DIALOG_DATA, {optional: true});
  readonly isEditMode = !!this.dialogData?.product;
  readonly submitButtonLabel = this.isEditMode ? 'Оновити' : 'Зберегти';
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent, ProductFormDialogResult>);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    category: this.fb.nonNullable.control<ProductCategory>(PRODUCT_CATEGORIES[0].value, Validators.required),
    startDate: this.fb.nonNullable.control(new Date(), Validators.required),
    condition: this.fb.control<ProductConditionsType | null>(null, Validators.required),
    price: this.fb.nonNullable.control(0, Validators.required),
    description: this.fb.nonNullable.control('', Validators.required),
  });

  constructor() {
    const product = this.dialogData?.product;
    if (!product) {
      return;
    }

    this.form.patchValue({
      name: product.name,
      category: product.category,
      condition: product.condition,
      startDate: product.startDate,
      price: product.price,
      description: product.description,
    });
  }

  getConditionLabel(condition: ProductConditionsType): string {
    return this.conditionLabelMap[condition];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UpdateProductDto = {
      name: this.form.controls.name.value,
      category: this.form.controls.category.value,
      condition: this.form.controls.condition.value!,
      startDate: this.form.controls.startDate.value,
      price: this.form.controls.price.value,
      description: this.form.controls.description.value,
    };

    const product = this.dialogData?.product;
    if (product) {
      this.dialogRef.close({
        mode: 'edit',
        id: product.id,
        payload,
        source: product.source,
        ownerUid: product.ownerUid,
      });
      return;
    }

    this.dialogRef.close({
      mode: 'create',
      payload: payload as CreateProductDto,
    });
  }
}
