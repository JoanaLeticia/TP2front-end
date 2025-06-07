import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ViewProdutoComponent } from '../view/view.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ProdutoService } from '../../../../core/services/product/produto.service';
import { Produto } from '../../../../core/models/produto.model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewProdutoComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatPaginatorModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './produto-list.component.html',
  styleUrl: './produto-list.component.css'
})
export class ProdutoListComponent {
  displayedColumns: string[] = ['id', 'nome', 'preco', 'estoque', 'acao'];
  produtos: Produto[] = [];

  totalRecords = 0;
  pageSize = 5;
  page = 0;

  produtosSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  ngOnDestroy(): void {
    if (this.produtosSubscription) {
      this.produtosSubscription.unsubscribe();
    }
  }

  carregarProdutos(): void {
    this.produtoService.findAll(this.page, this.pageSize).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        console.log('produtos carregados:', produtos); // Verifique no console
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

  paginar(event: PageEvent) : void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ngOnInit();
  }

  searchText: string = '';
  search() {
    if (!this.searchText.trim()) {
      this.produtoService.findAll().subscribe(
        data => {
          this.produtos = data;
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
        this.produtos = data;
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
            this.produtos = this.produtos.filter(adm => adm.id !== produto.id);
          }
        );
      }
    });
  }

  visualizarDados(produto: Produto): void {
    this.dialog.open(ViewProdutoComponent, {
      width: '600px',
      height: '455px',
      data: produto
    });
    console.log(produto)
  }
}