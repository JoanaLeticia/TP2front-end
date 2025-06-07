import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemPedido } from '../../models/item-pedido.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private readonly CARRINHO_KEY = 'carrinho';
  private carrinhoSubject = new BehaviorSubject<ItemPedido[]>(this.obterCarrinhoLocal());
  
  carrinho$: Observable<ItemPedido[]> = this.carrinhoSubject.asObservable();

  constructor() {}

  private obterCarrinhoLocal(): ItemPedido[] {
    const carrinho = localStorage.getItem(this.CARRINHO_KEY);
    return carrinho ? JSON.parse(carrinho) : [];
  }

  private salvarCarrinho(carrinho: ItemPedido[]): void {
    localStorage.setItem(this.CARRINHO_KEY, JSON.stringify(carrinho));
    this.carrinhoSubject.next(carrinho);
  }

  adicionarItem(item: ItemPedido): void {
    const carrinho = this.obterCarrinhoLocal();
    const itemExistente = carrinho.find(i => i.id === item.id);

    if (itemExistente) {
      itemExistente.quantidade += item.quantidade || 1;
    } else {
      carrinho.push({ ...item, quantidade: item.quantidade || 1 });
    }

    this.salvarCarrinho(carrinho);
  }

  atualizarQuantidade(itemId: number, quantidade: number): void {
    if (quantidade < 1) return;

    const carrinho = this.obterCarrinhoLocal();
    const item = carrinho.find(i => i.id === itemId);

    if (item) {
      item.quantidade = quantidade;
      this.salvarCarrinho(carrinho);
    }
  }

  removerItem(itemId: number): void {
    const carrinho = this.obterCarrinhoLocal()
      .filter(item => item.id !== itemId);
    this.salvarCarrinho(carrinho);
  }

  limparCarrinho(): void {
    this.salvarCarrinho([]);
  }

  getTotalItens(): number {
    return this.carrinhoSubject.value.reduce((total, item) => total + item.quantidade, 0);
  }

  getTotalValor(): number {
    return parseFloat(this.carrinhoSubject.value
      .reduce((total, item) => total + (item.valor * item.quantidade), 0)
      .toFixed(2));
  }
}