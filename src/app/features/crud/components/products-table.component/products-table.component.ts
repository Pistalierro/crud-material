import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ProductListItem} from '../../../../core/models/product.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {PRODUCT_CATEGORY_LABEL_MAP, ProductCategory} from '../../../../core/constants/products-constants';
import {LengthPipe} from '../../../../shared/pipes/length-pipe';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-products-table',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    CurrencyPipe,
    LengthPipe,
    ReactiveFormsModule
  ],
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.scss',
})
export class ProductsTableComponent implements AfterViewInit {

  readonly categoryLabelMap = PRODUCT_CATEGORY_LABEL_MAP;
  readonly dataSource = new MatTableDataSource<ProductListItem>([]);
  readonly filterControl = new FormControl('', {nonNullable: true});

  @Input({required: true}) displayedColumns: Array<keyof ProductListItem | 'actions'> = [];
  @Input() isAdmin = false;

  @Output() edit = new EventEmitter<ProductListItem>();
  @Output() delete = new EventEmitter<ProductListItem>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input({required: true}) set products(value: ProductListItem[]) {
    this.dataSource.data = value;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.filterControl.valueChanges.subscribe((value: string) => {
      this.dataSource.filter = value.trim().toLowerCase();

      if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    });
  }

  onEdit(product: ProductListItem): void {
    this.edit.emit(product);
  }

  onDelete(product: ProductListItem): void {
    this.delete.emit(product);
  }

  getCategoryLabel(category: ProductCategory): string {
    return this.categoryLabelMap[category];
  }

  canManage(product: ProductListItem): boolean {
    return this.isAdmin || product.source === 'sandbox';
  }
}
