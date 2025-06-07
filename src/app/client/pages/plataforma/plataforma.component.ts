import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-plataforma',
  standalone: true,
  templateUrl: './plataforma.component.html',
  styleUrl: './plataforma.component.css',
  imports: [FooterComponent, HeaderComponent, GridProdutosComponent, CommonModule, MatPaginatorModule]
})
export class PlataformaComponent implements OnInit {
  produtos: Produto[] = [];
  plataforma = '';
  
  // variaveis de controle para a paginacao
  totalRecords = 0;
  pageSize = 10;
  page = 0;

  constructor(private route: ActivatedRoute, private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.plataforma = params.get('nome') || '';
      //this.pageIndex = 0;
      this.buscarProdutos();
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ngOnInit();
  }

  buscarProdutos() {
    this.produtoService.getByPlataforma(this.plataforma).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }
}
