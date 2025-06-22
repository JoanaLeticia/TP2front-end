import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PedidoService } from '../../../../core/services/order/pedido.service'; 
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidoResolver implements Resolve<any> {
  constructor(private pedidoService: PedidoService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = Number(route.paramMap.get('id'));
    console.log('Resolver - Buscando pedido ID:', id);
    
    return this.pedidoService.findById(id).pipe(
      catchError(error => {
        console.error('Resolver - Erro ao buscar pedido:', error);
        return of(null); // Retorna null em caso de erro
      })
    );
  }
}