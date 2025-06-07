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
  @Input() produtosInput: Produto[] = [];
  cards = signal<Card[]>([]);
  produtos: Produto[] = [];

  constructor(private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  ngOnInit(): void {
    this.carregarConsultas();
  }

  ngOnChanges() {
    if (this.produtosInput) {
      this.carregarCardsFromInput();
    }
  }

  private carregarCardsFromInput() {
    const cards: Card[] = this.produtosInput.map(produto => ({
      idProduto: produto.id,
      titulo: produto.nome,
      preco: produto.preco,
      urlImagem: this.produtoService.getUrlImagem(produto.imagem),
      plataforma: produto.plataforma?.nome ?? 'N/A',
      midia: produto.tipoMidia?.nome ?? 'N/A'
    }));
    this.cards.set(cards);
  }

  carregarConsultas() {
    this.produtoService.getAllPaginacao(0, 10).subscribe(data => {
      this.produtos = data;
      this.carregarCards();
    });
  }

  carregarCards() {
    const cards: Card[] = [];
    this.produtos.forEach(produto => {
      cards.push({
        idProduto: produto.id,
        titulo: produto.nome,
        preco: produto.preco,
        urlImagem: this.produtoService.getUrlImagem(produto.imagem),
        plataforma: produto.plataforma?.nome ?? 'N/A',
        midia: produto.tipoMidia?.nome ?? 'N/A'
      });
    });
    this.cards.set(cards);
    console.log("Carregou os cards")
  }

  adicionarAoCarrinho(card: Card) {
    this.carrinhoService.adicionarItem({
      id: card.idProduto,
      nome: card.titulo,
      valor: card.preco,
      quantidade: 1
    })
    console.log("Adicionou o card ao carrinho")
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