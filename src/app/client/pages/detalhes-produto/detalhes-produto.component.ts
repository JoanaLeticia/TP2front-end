import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { Observable, switchMap } from 'rxjs';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Produto } from '../../../core/models/produto.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ItemPedido } from '../../../core/models/item-pedido.model';



@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './detalhes-produto.component.html',
  styleUrl: './detalhes-produto.component.css'
})
export class DetalhesProdutoComponent implements OnInit {
  produto$!: Observable<Produto>;
  imageUrl: string | null = null;
  activeToggle: number | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.produto$ = this.route.paramMap.pipe(
      switchMap(params => {
        const produtoId = Number(params.get('id'));
        return this.produtoService.findById(produtoId);
      })
    );

    this.produto$.subscribe({
      next: (produto) => {
        console.log('Produto completo:', produto);
        console.log('Classificação:', produto.classificacao);
        if (produto?.nomeImagem) {
          this.imageUrl = this.produtoService.getUrlImagem(produto.nomeImagem);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produto:', err);
        this.isLoading = false;
      }
    });
  }

  toggleSection(sectionId: number): void {
    this.activeToggle = this.activeToggle === sectionId ? null : sectionId;
  }

  adicionarAoCarrinho(produto: Produto): void {
    const item: ItemPedido = {
      id: produto.id,
      nome: produto.nome,
      valor: produto.preco,
      quantidade: 1,
      desenvolvedora: produto.desenvolvedora,
      plataforma: produto.plataforma?.nome || 'N/A',
      tipoMidia: produto.tipoMidia?.nome || 'N/A',
      nomeImagem: produto.nomeImagem,
      imagemUrl: produto.nomeImagem
        ? this.produtoService.getUrlImagem(produto.nomeImagem)
        : '../../../../assets/imagens/sem-imagem.jpg'
    };

    this.carrinhoService.adicionarItem(item);

    this.router.navigate(['/gameverse/carrinho']);
  }

}