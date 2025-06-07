import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';

@Component({
  selector: 'app-plataforma',
  standalone: true,
  templateUrl: './plataforma.component.html',
  styleUrl: './plataforma.component.css',
  imports: [FooterComponent, HeaderComponent, GridProdutosComponent]
})
export class PlataformaComponent implements OnInit {
  produtos: Produto[] = [];
  plataforma = '';

  constructor(private route: ActivatedRoute, private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.plataforma = params.get('nome') || '';
      this.buscarProdutos();
    });
  }

  buscarProdutos() {
    this.produtoService.getByPlataforma(this.plataforma).subscribe(produtos => {
      this.produtos = produtos;
    });
  }
}
