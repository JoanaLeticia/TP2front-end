import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private viaCepUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  validarCep(cep: string): Observable<{ valido: boolean, erro?: string }> {
    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      return of({ valido: false, erro: 'CEP deve ter 8 dígitos' });
    }

    return this.http.get(`${this.viaCepUrl}/${cepNumerico}/json`).pipe(
      map((response: any) => {
        if (response.erro) {
          return { valido: false, erro: 'CEP não encontrado' };
        }
        return { valido: true };
      }),
      catchError(() => {
        return of({ valido: false, erro: 'Erro ao validar CEP' });
      })
    );
  }

  formatarCep(cep: string): string {
    const cepNumerico = cep.replace(/\D/g, '');
    if (cepNumerico.length === 8) {
      return `${cepNumerico.substring(0, 5)}-${cepNumerico.substring(5)}`;
    }
    return cep;
  }
}