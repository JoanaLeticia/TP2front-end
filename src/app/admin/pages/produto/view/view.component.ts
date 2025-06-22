import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Produto } from '../../../../core/models/produto.model';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewProdutoComponent {
  produtos: Produto[] = [];

  constructor(
    public dialogRef: MatDialogRef<ViewProdutoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Produto,
    private router: Router
  ) { }


  editar(id: number): void {
    this.router.navigate(['/produtos/edit', id]);
    this.dialogRef.close(); 
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}