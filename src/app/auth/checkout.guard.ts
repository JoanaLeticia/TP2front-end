import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CarrinhoService } from '../core/services/order/carrinho.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutGuard implements CanActivate {
  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const itens = this.carrinhoService.getItens();
    
    if (itens.length === 0) {
      this.router.navigate(['/gameverse/carrinho']);
      return false;
    }
    
    return true;
  }
}