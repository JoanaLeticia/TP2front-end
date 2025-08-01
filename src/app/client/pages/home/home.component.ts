import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Card } from '../../../core/models/card.model';
import { CardProdutoComponent } from '../card-produto/card-produto.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, GridProdutosComponent, CommonModule, SlickCarouselModule, CardProdutoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  produtos: Produto[] = [];
  maisVendidos: Card[] = [];

  constructor(private route: ActivatedRoute, private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      //this.pageIndex = 0;
      this.buscarProdutos();
    });
  }

  buscarProdutos() {
    this.produtoService.findAll().subscribe({
      next: (produtos) => {
        this.produtos = produtos.slice(0, 10);
        this.maisVendidos = produtos.slice(0, 8).map(produto => ({
          idProduto: produto.id,
          titulo: produto.nome,
          preco: produto.preco,
          urlImagem: 'http://localhost:8080/produtos/image/download/' + produto.nomeImagem,
          plataforma: produto.plataforma?.nome ?? 'N/A',
          midia: produto.tipoMidia?.nome ?? 'N/A'
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

  carrosselMaisVendidosConfig = {
    "slidesToShow": 5,
    "slidesToScroll": 1,
    "autoplay": false,
    "arrows": true,
    "dots": false,
    "infinite": true,
    "responsive": [
      {
        "breakpoint": 1024,
        "settings": {
          "slidesToShow": 3
        }
      },
      {
        "breakpoint": 768,
        "settings": {
          "slidesToShow": 2
        }
      },
      {
        "breakpoint": 480,
        "settings": {
          "slidesToShow": 1
        }
      }
    ],
    "prevArrow": '<button type="button" class="slick-prev-custom"><i class="fas fa-chevron-left"></i></button>',
    "nextArrow": '<button type="button" class="slick-next-custom"><i class="fas fa-chevron-right"></i></button>'
  }

  myImages = [
    { src: '../../../../assets/banner-forza.png' },
    { src: '../../../../assets/banner-shadows.png' },
    { src: '../../../../assets/banner-expresso.png' },
  ]

  myConfig = {
    "slidesToShow": 1,
    "slidesToScroll": 1,
    "autoplay": true,
    "arrows": true,
    "dots": true,
    "infinite": true,
    "prevArrow": '<button type="button" class="slick-prev-custom"><i class="fas fa-chevron-left"></i></button>',
    "nextArrow": '<button type="button" class="slick-next-custom"><i class="fas fa-chevron-right"></i></button>'
  }
}