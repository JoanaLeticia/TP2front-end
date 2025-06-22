import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoResolver implements Resolve<any> {
  constructor(private carrinhoService: CarrinhoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.carrinhoService.carrinho$;
  }
}