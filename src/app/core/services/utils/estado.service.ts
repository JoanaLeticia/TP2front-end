import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estado } from '../../models/estado.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private baseUrl = 'http://localhost:8080/estados';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number): Observable<Estado[]> {
    let params = {};

    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      }
    }

    return this.httpClient.get<{ dados: Estado[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }

  findByNome(nome: string): Observable<Estado[]> {
    return this.httpClient.get<Estado[]>(`${this.baseUrl}/search/nome/${nome}`);
  }

  findById(id: number): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.baseUrl}/${id}`);
  }

  insert(estado: Estado): Observable<Estado> {
    return this.httpClient.post<Estado>(this.baseUrl, estado);
  }

  update(estado: Estado): Observable<Estado> {
    return this.httpClient.put<Estado>(`${this.baseUrl}/${estado.id}`, estado);
  }

  delete(estado: Estado): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${estado.id}`);
  }
}