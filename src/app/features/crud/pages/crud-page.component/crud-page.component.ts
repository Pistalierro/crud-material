import {AfterViewInit, Component, effect, inject, signal, ViewChild} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {
  ProductFormDialogComponent,
  ProductFormDialogData,
  ProductFormDialogResult
} from '../../components/product-form-dialog.component/product-form-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {CreateProductDto, UpdateProductDto} from '../../../../core/models/product-dto.model';
import {ProductsFirestoreService} from '../../../../core/services/products-firestore.service';
import {Product} from '../../../../core/models/product.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {PRODUCT_TABLE_COLUMNS} from '../../../../core/constants/products-constants';
import {MatInputModule} from '@angular/material/input';
import {DatePipe} from '@angular/common';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-crud-page',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSnackBarModule,
    DatePipe
  ],
  templateUrl: './crud-page.component.html',
  styleUrl: './crud-page.component.scss',
})
export class CrudPageComponent implements AfterViewInit {


  readonly dataSource = new MatTableDataSource<Product>([]);
  readonly dialog = inject(MatDialog);
  readonly displayedColumns = PRODUCT_TABLE_COLUMNS;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  readonly isSaving = signal(false);
  private readonly snackBar = inject(MatSnackBar);
  private readonly productsFirestoreService = inject(ProductsFirestoreService);
  readonly products = toSignal(this.productsFirestoreService.getProducts(), {initialValue: []});

  constructor() {
    effect(() => {
      this.dataSource.data = this.products();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open<ProductFormDialogComponent, void, ProductFormDialogResult>(
      ProductFormDialogComponent,
      {
        panelClass: 'products-dialog-panel',
        width: '30%',
        maxWidth: '95vw',
        autoFocus: false,
      },
    );

    dialogRef.afterClosed().subscribe((result: ProductFormDialogResult | undefined) => {
      if (!result) {
        return;
      }

      if (result.mode === 'create') {
        void this.handleCreate(result.payload);
        return;
      }

      void this.handleUpdate(result.id, result.payload);
    });
  }


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(product: Product): void {
    const dialogRef = this.dialog.open<ProductFormDialogComponent, ProductFormDialogData, ProductFormDialogResult>(
      ProductFormDialogComponent,
      {
        panelClass: 'products-dialog-panel',
        width: '30%',
        maxWidth: '95vw',
        autoFocus: false,
        data: {product},
      },
    );

    dialogRef.afterClosed().subscribe((result: ProductFormDialogResult | undefined) => {
      if (!result || result.mode !== 'edit') {
        return;
      }

      void this.handleUpdate(result.id, result.payload);
    });
  }

  async onDelete(product: Product): Promise<void> {
    try {
      await this.productsFirestoreService.deleteProduct(product.id);
      this.snackBar.open('Товар удалён', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to delete product:', error);

      this.snackBar.open('Не удалось удалить товар. Попробуй снова.', 'OK', {
        duration: 3500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  private async handleUpdate(id: string, payload: UpdateProductDto): Promise<void> {
    try {
      await this.productsFirestoreService.updateProduct(id, payload);

      this.snackBar.open('Товар обновлён', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to update product:', error);

      this.snackBar.open('Не удалось обновить товар. Попробуй снова.', 'OK', {
        duration: 3500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }


  private async handleCreate(payload: CreateProductDto): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    try {
      const createdId = await this.productsFirestoreService.addProduct(payload);
      console.log('Product created with id:', createdId);

      this.snackBar.open('Товар успешно добавлен', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to create product:', error);

      this.snackBar.open('Не удалось сохранить товар. Попробуй снова.', 'OK', {
        duration: 3500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } finally {
      this.isSaving.set(false);
    }
  }

}
