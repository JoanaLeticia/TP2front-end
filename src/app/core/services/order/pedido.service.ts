import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:8080/pedidos';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(this.baseUrl);
  }

  /*findByPedido(Pedido: string): Observable<Pedido[]> {
    return this.httpClient.get<Pedido[]>(`${this.baseUrl}/search/pedidos/${Pedido}`);
  }*/

  findById(id: number): Observable<Pedido> {
    return this.httpClient.get<Pedido>(`${this.baseUrl}/${id}`);
  }

  // pedido.service.ts
  insert(pedidoData: { itens: Array<{ idProduto: number, quantidade: number }> }): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}`, pedidoData);
  }

  /*update(Pedido: Pedido): Observable<Pedido> {
    return this.httpClient.put<Pedido>(`${this.baseUrl}/${Pedido.id}`, Pedido);
  }*/

  delete(Pedido: Pedido): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${Pedido.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }
}