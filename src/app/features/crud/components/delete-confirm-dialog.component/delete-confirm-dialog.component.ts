import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

export interface DeleteConfirmDialogData {
  productName: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
  ],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss',
})
export class DeleteConfirmDialogComponent {

  readonly data = inject<DeleteConfirmDialogData>(MAT_DIALOG_DATA);
}
