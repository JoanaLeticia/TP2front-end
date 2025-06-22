import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Municipio } from '../../../../core/models/municipio.model';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewMunicipioComponent {
  municipios: Municipio[] = [];

  constructor(
    public dialogRef: MatDialogRef<ViewMunicipioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Municipio,
    private router: Router
  ) { }


  editar(id: number): void {
    this.router.navigate(['/municipio/edit', id]);
    this.dialogRef.close(); 
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}