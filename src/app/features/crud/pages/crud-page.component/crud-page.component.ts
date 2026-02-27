import {Component, inject, signal} from '@angular/core';
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
import {PRODUCT_TABLE_COLUMNS} from '../../../../core/constants/products-constants';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {toSignal} from '@angular/core/rxjs-interop';
import {ProductsTableComponent} from '../../components/products-table.component/products-table.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData
} from '../../components/delete-confirm-dialog.component/delete-confirm-dialog.component';
import {catchError, finalize, of} from 'rxjs';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-crud-page',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    ProductsTableComponent
  ],
  templateUrl: './crud-page.component.html',
  styleUrl: './crud-page.component.scss',
})
export class CrudPageComponent {

  readonly dialog = inject(MatDialog);
  readonly displayedColumns = PRODUCT_TABLE_COLUMNS;
  readonly isSaving = signal(false);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  private readonly snackBar = inject(MatSnackBar);
  private readonly productsFirestoreService = inject(ProductsFirestoreService);
  readonly products = toSignal(
    this.productsFirestoreService.getProducts().pipe(
      catchError((error) => {
        console.error('Failed to load products:', error);
        this.loadError.set('Не удалось загрузить товары.');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false)),
    ),
    {initialValue: []},
  );

  openDialog(): void {
    const dialogRef = this.openProductDialog();
    dialogRef.afterClosed().subscribe((result) => this.handleDialogResult(result));
  }

  onEdit(product: Product): void {
    const dialogRef = this.openProductDialog({product});
    dialogRef.afterClosed().subscribe((result) => this.handleDialogResult(result));
  }

  onDelete(product: Product): void {
    const dialogRef = this.dialog.open<DeleteConfirmDialogComponent, DeleteConfirmDialogData, boolean>(
      DeleteConfirmDialogComponent,
      {
        panelClass: 'delete-dialog-panel',
        width: 'min(420px, 96vw)',
        maxWidth: '96vw',
        autoFocus: false,
        data: {productName: product.name},
      },
    );

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) {
        return;
      }

      void this.performDelete(product);
    });
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
      await this.productsFirestoreService.addProduct(payload);

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

  private openProductDialog(
    data?: ProductFormDialogData,
  ): import('@angular/material/dialog').MatDialogRef<ProductFormDialogComponent, ProductFormDialogResult> {
    return this.dialog.open<ProductFormDialogComponent, ProductFormDialogData | void, ProductFormDialogResult>(
      ProductFormDialogComponent,
      {
        panelClass: 'products-dialog-panel',
        width: 'min(760px, 96vw)',
        maxWidth: '96vw',
        maxHeight: '92dvh',
        autoFocus: false,
        data,
      },
    );
  }

  private handleDialogResult(result: ProductFormDialogResult | undefined): void {
    if (!result) return;

    if (result.mode === 'create') {
      void this.handleCreate(result.payload);
      return;
    }
    void this.handleUpdate(result.id, result.payload);
  }

  private async performDelete(product: Product): Promise<void> {
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
}
