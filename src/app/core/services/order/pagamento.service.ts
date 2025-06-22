import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagamento } from '../../models/pagamento.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/pagamentos';

  constructor(private http: HttpClient) { }

  findAll(page?: number, size?: number): Observable<Pagamento[]> {
    const params: any = {};
    if (page !== undefined) params.page = page.toString();
    if (size !== undefined) params.size = size.toString();

    return this.http.get<Pagamento[]>(this.baseUrl, { params });
  }

  findById(id: number): Observable<Pagamento> {
    return this.http.get<Pagamento>(`${this.baseUrl}/${id}`);
  }

  findByOrderId(orderId: number): Observable<Pagamento> {
    return this.http.get<Pagamento>(`${this.baseUrl}/pedido/${orderId}`);
  }

  create(payment: Pagamento): Observable<Pagamento> {
    return this.http.post<Pagamento>(this.baseUrl, payment);
  }

  update(id: number, payment: Pagamento): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  approvePayment(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/aprovar`, null);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
}