import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endereco } from '../../models/endereco.model';


@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
    private baseUrl = 'http://localhost:8080/enderecos';
  
    constructor(private httpClient: HttpClient) {  }
  
    findAll(): Observable<Endereco[]> {
      return this.httpClient.get<Endereco[]>(this.baseUrl);
    }

    findByLogradouro(logradouro: string): Observable<Endereco[]> {
      return this.httpClient.get<Endereco[]>(`${this.baseUrl}/search/logradouro/${logradouro}`);
    }
  
    findById(id: number): Observable<Endereco> {
      return this.httpClient.get<Endereco>(`${this.baseUrl}/${id}`);
    }
  
    insert(endereco: Endereco): Observable<Endereco> {
      return this.httpClient.post<Endereco>(this.baseUrl, endereco);
    }
    
    update(endereco: Endereco): Observable<Endereco> {
      return this.httpClient.put<Endereco>(`${this.baseUrl}/${endereco.id}`, endereco);
    }
  
    delete(endereco: Endereco): Observable<any> {
      return this.httpClient.delete<any>(`${this.baseUrl}/${endereco.id}`);
    }
}