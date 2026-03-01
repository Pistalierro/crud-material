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
import {ProductListItem} from '../../../../core/models/product.model';
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
import {AuthSessionService} from '../../../../core/services/auth-session.service';

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
  readonly authSessionService = inject(AuthSessionService);
  readonly displayedColumns = PRODUCT_TABLE_COLUMNS;
  readonly isSaving = signal(false);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly isAdmin = toSignal(
    this.authSessionService.adminState$(),
    {initialValue: false},
  );
  private readonly snackBar = inject(MatSnackBar);
  private readonly productsFirestoreService = inject(ProductsFirestoreService);
  readonly products = toSignal(
    this.productsFirestoreService.getProducts().pipe(
      catchError((error) => {
        console.error('Failed to load products:', error);
        this.loadError.set('Не вдалося завантажити товари.');
        return of<ProductListItem[]>([]);
      }),
      finalize(() => this.isLoading.set(false)),
    ),
    {initialValue: [] as ProductListItem[]},
  );

  openDialog(): void {
    const dialogRef = this.openProductDialog();
    dialogRef.afterClosed().subscribe((result) => this.handleDialogResult(result));
  }

  onEdit(product: ProductListItem): void {
    const dialogRef = this.openProductDialog({product});
    dialogRef.afterClosed().subscribe((result) => this.handleDialogResult(result));
  }

  onDelete(product: ProductListItem): void {
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

  async onAdminLogin(): Promise<void> {
    try {
      await this.authSessionService.signInAsAdmin();
      await this.authSessionService.refreshAuthToken();

      this.snackBar.open('Вхід через Google виконано', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to sign in as admin:', error);

      this.snackBar.open('Не вдалося увійти через Google. Спробуй ще раз.', 'OK', {
        duration: 3500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  private async handleUpdate(
    id: string,
    payload: UpdateProductDto,
    source: ProductListItem['source'],
    ownerUid: ProductListItem['ownerUid'],
  ): Promise<void> {
    try {
      await this.productsFirestoreService.updateProduct(id, payload, source, ownerUid);

      this.snackBar.open('Товар оновлено', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to update product:', error);

      this.snackBar.open('Не вдалося оновити товар. Спробуй ще раз.', 'OK', {
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

      this.snackBar.open('Товар успішно додано', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to create product:', error);

      this.snackBar.open('Не вдалося зберегти товар. Спробуй ще раз.', 'OK', {
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

    void this.handleUpdate(result.id, result.payload, result.source, result.ownerUid);
  }

  private async performDelete(product: ProductListItem): Promise<void> {
    try {
      await this.productsFirestoreService.deleteProduct(product.id, product.source, product.ownerUid);
      this.snackBar.open('Товар видалено', 'OK', {
        duration: 2500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
      this.snackBar.open('Не вдалося видалити товар. Спробуй ще раз.', 'OK', {
        duration: 3500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }
}
