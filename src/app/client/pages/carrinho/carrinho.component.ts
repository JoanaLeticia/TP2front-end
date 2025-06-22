import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { style } from '@angular/animations';
import { PedidoService } from '../../../core/services/order/pedido.service';
import { AuthService } from '../../../auth/auth.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Pedido } from '../../../core/models/pedido.model';
import { map, switchMap, tap, throwError } from 'rxjs';
import { EnderecoService } from '../../../core/services/utils/endereco.service';

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

  constructor(
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private enderecoService: EnderecoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carrinhoService.carrinho$.subscribe(itens => {
      this.carrinhoItens = itens;

      console.log('itens:', itens);
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
      duration: 3000, panelClass: ['custom-snackbar'], horizontalPosition: 'center', verticalPosition: 'top'
    });
  }

  calcularTotal(): number {
    return this.carrinhoService.getTotalValor();
  }

  finalizarCompra(): void {
    this.authService.getUsuarioLogado().pipe(
      tap(usuario => console.log('Usuário logado:', usuario)),

      switchMap(usuario => {
        if (!usuario) {
          console.log('Nenhum usuário logado');
          this.router.navigate(['/gameverse/login']);
          throw new Error('Usuário não logado');
        }

        console.log('Buscando cliente completo para usuário ID:', usuario.id);
        return this.authService.getClienteCompleto();
      }),
      switchMap(cliente => {
        if (!cliente) {
          return throwError(() => new Error('Cliente não encontrado'));
        }

        return this.enderecoService.findByClienteId(cliente.id).pipe(
          map(enderecos => {
            cliente.listaEndereco = enderecos;
            return cliente;
          })
        );
      })
    ).subscribe({
      next: (cliente) => {
        /*if (!cliente.listaEndereco || cliente.listaEndereco.length === 0) {
          this.snackBar.open('Cadastre um endereço antes de finalizar a compra', 'Fechar', { duration: 5000, panelClass: ['custom-snackbar'] });
          this.router.navigate(['/gameverse/enderecos']);
          return;
        }*/

        this.router.navigate(['/gameverse/checkout']);
      },
      error: (error) => {
        console.error('Erro ao obter cliente:', error);
        this.snackBar.open('Erro ao carregar dados do cliente', 'Fechar', { duration: 5000, panelClass: ['custom-snackbar'] });
      }
    });
  }
}