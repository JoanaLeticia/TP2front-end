import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { NavsideComponent } from "../../../components/navside/navside.component";
import { HeaderComponent } from "../../../components/header/header.component";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ViewProdutoComponent } from '../view/view.component';
import { Produto } from '../../../../core/models/produto.model';
import { ProdutoService } from '../../../../core/services/product/produto.service';

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './produto-list.component.html',
  styleUrl: './produto-list.component.css',
  imports: [RouterModule, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, MatTableModule]
})
export class ProdutoListComponent {
  displayedColumns: string[] = ['id', 'nome', 'descricao', 'valor', 'acao'];
  produto: Produto[] = [];
  produtoSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.produtoSubscription = this.produtoService.findAll().subscribe(data => {
      this.produto = data;
      console.log(data);
    });
  }

  ngOnDestroy(): void {
    if (this.produtoSubscription) {
      this.produtoSubscription.unsubscribe();
    }
  }

  searchText: string = '';
  search() {
    if (!this.searchText.trim()) {
      this.produtoService.findAll().subscribe(
        data => {
          this.produto = data;
        },
        error => {
          console.error('Erro ao buscar produtos:', error);
        }
      );
      return;
    }
    const termoDeBusca = this.searchText.toLowerCase();
    this.produtoService.findByNome(termoDeBusca).subscribe(
      data => {
        this.produto = data;
      },
      error => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  confirmDelete(produto: Produto): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && produto && produto.id !== undefined) {

        this.produtoService.delete(produto).subscribe(
          () => {
            this.produto = this.produto.filter(adm => adm.id !== produto.id);
          }
        );
      }
    });
  }

  visualizarDados(produto: Produto): void {
    this.dialog.open(ViewProdutoComponent, {
      data: produto
    });
  }
}