import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Admin } from '../../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'https://localhost:8080/administradores';

  constructor(private httpClient: HttpClient) { }

  findAll(page?: number, pageSize?: number, nome?: String): Observable<Admin[]> {
    let params = {}
    if (page !== undefined && pageSize !== undefined) {
      params = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        nome: nome
      }
    }
    return this.httpClient.get<Admin[]>(`${this.baseUrl}`, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  findByNome(nome: string): Observable<Admin[]> {
    return this.httpClient.get<Admin[]>(`${this.baseUrl}/search/nome/${nome}`);
  }

  findById(id: number): Observable<Admin> {
    return this.httpClient.get<Admin>(`${this.baseUrl}/${id}`);
  }

  create(administrador: Admin): Observable<Admin> {
    return this.httpClient.post<Admin>(this.baseUrl, administrador);
  }

  update(administrador: Admin): Observable<Admin> {
    return this.httpClient.put<Admin>(`${this.baseUrl}/${administrador.id}`, administrador);
  }

  delete(administrador: Admin): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${administrador.id}`);
  }

}
