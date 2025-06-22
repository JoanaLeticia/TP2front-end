import { Component, Inject } from '@angular/core';
import { Estado } from '../../../../core/models/estado.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewEstadoComponent {
  estados: Estado[] = [];

  constructor(
    public dialogRef: MatDialogRef<ViewEstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Estado,
    private router: Router
  ) { }


  editar(id: number): void {
    this.router.navigate(['/estado/edit', id]);
    this.dialogRef.close();
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}