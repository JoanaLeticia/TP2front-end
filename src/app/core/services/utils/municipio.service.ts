import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Municipio } from '../../models/municipio.model';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MunicipioService {
  private baseUrl = 'http://localhost:8080/municipios';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number): Observable<Municipio[]> {
    let params = {};

    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      }
    }

    return this.httpClient.get<{ dados: Municipio[] }>(this.baseUrl, { params }).pipe(
      map(response => response.dados)
    );
  }

  findByNome(nome: string): Observable<Municipio[]> {
    return this.httpClient.get<Municipio[]>(`${this.baseUrl}/search/nome/${nome}`);
  }

  findById(id: number): Observable<Municipio> {
    return this.httpClient.get<Municipio>(`${this.baseUrl}/${id}`);
  }

  insert(municipio: Municipio): Observable<Municipio> {
    return this.httpClient.post<Municipio>(this.baseUrl, municipio);
  }

  update(municipio: Municipio): Observable<Municipio> {
    return this.httpClient.put<Municipio>(`${this.baseUrl}/${municipio.id}`, municipio);
  }

  delete(municipio: Municipio): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${municipio.id}`);
  }
}