import {Component, inject} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  ProductCategory,
  ProductConditionsType
} from '../../../../core/constants/products-constants';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {CreateProductDto} from '../../../../core/models/product-dto.model';

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
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    category: this.fb.nonNullable.control<ProductCategory>(PRODUCT_CATEGORIES[0].value, Validators.required),
    startDate: this.fb.nonNullable.control(new Date(), Validators.required),
    condition: this.fb.control<ProductConditionsType | null>(null, Validators.required),
    price: this.fb.nonNullable.control(0, Validators.required),
    description: this.fb.nonNullable.control('', Validators.required),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateProductDto = {
      name: this.form.controls.name.value,
      category: this.form.controls.category.value,
      condition: this.form.controls.condition.value!,
      startDate: this.form.controls.startDate.value,
      price: this.form.controls.price.value,
      description: this.form.controls.description.value,
    };

    this.dialogRef.close(payload);
  }
}
