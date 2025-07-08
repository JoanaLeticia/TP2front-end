import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardTitle, MatCardFooter } from '@angular/material/card';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/product/produto.service';
import { Card } from '../../../core/models/card.model';
import { CardProdutoComponent } from '../card-produto/card-produto.component';

@Component({
  selector: 'app-grid-produtos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCard, MatCardActions, MatCardContent, MatCardTitle, MatCardFooter, NgFor, MatButton, CardProdutoComponent],
  templateUrl: './grid-produtos.component.html',
  styleUrl: './grid-produtos.component.css'
})
export class GridProdutosComponent implements OnInit {
  @Input() produtosInput: Produto[] | null = null; // Alterado para aceitar null
  cards = signal<Card[]>([]);
  produtos: Produto[] = [];

  constructor(private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  ngOnInit(): void {
    // Se não receber produtos via input, carrega do serviço
    if (!this.produtosInput) {
      this.carregarProdutos();
    }
  }

  ngOnChanges() {
    if (this.produtosInput) {
      this.carregarCardsFromInput();
    }
  }

  @Input() layoutMode: 'default' | 'home' = 'default';

  private carregarCardsFromInput() {
    const cards: Card[] = (this.produtosInput || []).map(produto => ({
      idProduto: produto.id,
      titulo: produto.nome,
      preco: produto.preco,
      urlImagem: this.produtoService.getUrlImagem(produto.nomeImagem),
      plataforma: produto.plataforma?.nome ?? 'N/A',
      midia: produto.tipoMidia?.nome ?? 'N/A'
    }));
    this.cards.set(cards);
  }

  private carregarProdutos() {
    this.produtoService.getAllPaginacao(0, 10).subscribe({
      next: (data) => {
        console.log('Dados recebidos:', data);
        this.produtos = Array.isArray(data) ? data : [];
        this.carregarCards();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.produtos = [];
        this.carregarCards();
      }
    });
  }

  carregarCards() {
    const cards: Card[] = [];
    
    // Verificação adicional de segurança
    if (Array.isArray(this.produtos)) {
      this.produtos.forEach(produto => {
        // Verificação de cada propriedade
        cards.push({
          idProduto: produto.id,
          titulo: produto.nome || 'Sem nome',
          preco: produto.preco || 0,
          urlImagem: produto.nomeImagem ? this.produtoService.getUrlImagem(produto.nomeImagem) : 'assets/imagem-padrao.jpg',
          plataforma: produto.plataforma?.nome ?? 'N/A',
          midia: produto.tipoMidia?.nome ?? 'N/A'
        });
      });
    }
    
    this.cards.set(cards);
    console.log("Cards carregados:", cards);
  }

  showSnackbarTopPosition(content: any, action: any) {
    this.snackBar.open(content, action, {
      duration: 2000,
      verticalPosition: "top",
      horizontalPosition: "center"
    });
  }

  onDetalhesProduto(id: number): void {
    this.router.navigate(['/gameverse/produto', id]);
  }
}