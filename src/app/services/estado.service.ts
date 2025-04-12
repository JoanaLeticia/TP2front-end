import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estado } from '../models/estado.model';

interface PaginacaoResponse<T> {
  dados: T[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private baseUrl: string = 'http://localhost:8080/estados';

  constructor(private httpClient: HttpClient) { }

  findAll(page: number = 0, pageSize: number = 10, sort: string = 'id'): Observable<PaginacaoResponse<Estado>> {
    const params = {
      page: page.toString(),
      page_size: pageSize.toString(),
      sort: sort
    };
    return this.httpClient.get<PaginacaoResponse<Estado>>(this.baseUrl, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  findById(id: string): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.baseUrl}/${id}`);
  }

  findByNome(nome: string, page: number, pageSize: number, sort: string = 'id'): Observable<PaginacaoResponse<Estado>> {
    const params = {
      page: page.toString(),
      page_size: pageSize.toString(),
      sort: sort
    };
    return this.httpClient.get<PaginacaoResponse<Estado>>(`${this.baseUrl}/nome/${nome}`, { params });
  }

  countByNome(nome: string): Observable<number> {
      return this.httpClient.get<number>(`${this.baseUrl}/nome/${nome}/count`);
  }

  insert(estado: Estado): Observable<Estado> {
    return this.httpClient.post<Estado>(this.baseUrl, estado);
  }

  update(estado: Estado): Observable<any> {
    return this.httpClient.put<Estado>(`${this.baseUrl}/${estado.id}`, estado);
  }

  delete(estado: Estado): Observable<any> {
    return this.httpClient.delete<Estado>(`${this.baseUrl}/${estado.id}`);
  }
}