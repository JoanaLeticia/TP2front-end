import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.css']
})
export class CarrinhoComponent implements OnInit {
  carrinhoItens: ItemPedido[] = [];
  metodoPagamento: string = 'cartao';

  constructor(
    private carrinhoService: CarrinhoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carrinhoService.carrinho$.subscribe(itens => {
      this.carrinhoItens = itens;
    });
  }

  aumentarQuantidade(item: ItemPedido): void {
    this.carrinhoService.atualizarQuantidade(item.id, item.quantidade + 1);
  }

  diminuirQuantidade(item: ItemPedido): void {
    if (item.quantidade > 1) {
      this.carrinhoService.atualizarQuantidade(item.id, item.quantidade - 1);
    }
  }

  removerItem(item: ItemPedido): void {
    this.carrinhoService.removerItem(item.id);
    this.snackBar.open('Item removido do carrinho', 'Fechar', {
      duration: 3000
    });
  }

  calcularTotal(): number {
    return this.carrinhoService.getTotalValor();
  }

  finalizarCompra(): void {
    // Lógica para finalizar compra
    this.snackBar.open('Compra finalizada com sucesso!', 'Fechar', {
      duration: 5000
    });
    this.carrinhoService.limparCarrinho();
  }
}