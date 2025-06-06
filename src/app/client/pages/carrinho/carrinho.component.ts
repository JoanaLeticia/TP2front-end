import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ItemPedido } from '../../../core/models/item-pedido.model';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [NgFor, NgIf, FooterComponent, HeaderComponent, CommonModule ],
  templateUrl: './carrinho.component.html',
  styleUrl: './carrinho.component.css'
})
export class CarrinhoComponent implements OnInit {
  openTab: number = 1;
  isToggle: any;
  country: string = "United States";
  carrinhoItens: ItemPedido[] = [];

  constructor(private carrinhoService: CarrinhoService
  ) { }

  
  ngOnInit(): void {
    this.carrinhoService.carrinho$.subscribe(itens => {
      this.carrinhoItens = itens;
    })
  }

  removerItem(item: ItemPedido): void {
    this.carrinhoService.remover(item);
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2); // Formata o valor para duas casas decimais
  }


  aumentarQuantidade(item: any) {
    // Verifica se o item ainda está disponível no carrinho
    const index = this.carrinhoItens.indexOf(item);
    if (index !== -1) {
      // Aumenta a quantidade do item
      this.carrinhoItens[index].quantidade++;
    }
  }

  diminuirQuantidade(item: any) {
    // Verifica se o item ainda está disponível no carrinho
    const index = this.carrinhoItens.indexOf(item);
    if (index !== -1 && this.carrinhoItens[index].quantidade > 0) {
      // Diminui a quantidade do item
      this.carrinhoItens[index].quantidade--;
    }
  }
  
  finalizarCompra(): void {

  }

  calcularTotal(): number {
    let total = 0;
    for (const item of this.carrinhoItens) {
      total += item.quantidade * item.valor;
      console.log(total)
    }
    return parseFloat(total.toFixed(2));
  }

}