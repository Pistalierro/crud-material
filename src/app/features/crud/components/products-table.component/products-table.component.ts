import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Product} from '../../../../core/models/product.model';
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
    LengthPipe
  ],
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.scss',
})
export class ProductsTableComponent implements AfterViewInit {

  readonly categoryLabelMap = PRODUCT_CATEGORY_LABEL_MAP;
  readonly dataSource = new MatTableDataSource<Product>([]);
  @Input({required: true}) displayedColumns: Array<keyof Product | 'actions'> = [];
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input({required: true}) set products(value: Product[]) {
    this.dataSource.data = value;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onEdit(product: Product): void {
    this.edit.emit(product);
  }

  onDelete(product: Product): void {
    this.delete.emit(product);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getCategoryLabel(category: ProductCategory): string {
    return this.categoryLabelMap[category];
  }
}
