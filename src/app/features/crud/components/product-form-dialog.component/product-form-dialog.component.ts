import {Component, OnInit} from '@angular/core';
import {MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormGroup} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, ProductConditionsType} from '../../../../core/constants/products-constants';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  selector: 'app-product-form-dialog',
  imports: [
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    MatDialogContent,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrl: './product-form-dialog.component.scss',
})
export class ProductFormDialogComponent implements OnInit {

  form!: FormGroup;
  readonly categories = PRODUCT_CATEGORIES;
  readonly productConditions: ProductConditionsType[] = PRODUCT_CONDITIONS;

  ngOnInit() {
  }

  initializeForm() {

  }
}
