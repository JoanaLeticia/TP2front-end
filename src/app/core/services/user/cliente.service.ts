import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../../models/cliente.model'; 

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
    private baseUrl = 'http://localhost:8080/clientes';
  
    constructor(private httpClient: HttpClient) {  }
  
    findAll(): Observable<Cliente[]> {
      return this.httpClient.get<Cliente[]>(this.baseUrl);
    }

    findByNome(nome: string): Observable<Cliente[]> {
      return this.httpClient.get<Cliente[]>(`${this.baseUrl}/search/nome/${nome}`);
    }
  
    findById(id: number): Observable<Cliente> {
      return this.httpClient.get<Cliente>(`${this.baseUrl}/${id}`);
    }
  
    insert(cliente: Cliente): Observable<Cliente> {
      return this.httpClient.post<Cliente>(this.baseUrl, cliente);
    }
    
    update(cliente: Cliente): Observable<Cliente> {
      return this.httpClient.put<Cliente>(`${this.baseUrl}/${cliente.id}`, cliente);
    }
  
    delete(cliente: Cliente): Observable<any> {
      return this.httpClient.delete<any>(`${this.baseUrl}/${cliente.id}`);
    }

}