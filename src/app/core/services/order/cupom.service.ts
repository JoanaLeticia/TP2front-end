import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Cupom, CupomValido } from '../../models/cupom.model';
import { CarrinhoService } from './carrinho.service';

@Injectable({
    providedIn: 'root'
})
export class CupomService {
    private apiUrl = 'http://localhost:8080/cupons';

    constructor(private http: HttpClient, private carrinhoService: CarrinhoService) { }

    validarCupom(codigo: string): Observable<CupomValido> {
        return this.http.get<Cupom>(`${this.apiUrl}/validar/${codigo}`).pipe(
            map(cupom => {
                // Calcula o desconto imediatamente
                let valorDesconto = 0;
                if (cupom.tipo.nome === 'Valor Fixo') {
                    valorDesconto = cupom.valor || 0;
                } else if (cupom.tipo.nome === 'Percentual') {
                    const total = this.carrinhoService.getTotalValor();
                    valorDesconto = total * (cupom.percentual || 0) / 100;
                }

                return {
                    valido: true,
                    cupom: cupom,
                    valorDesconto: valorDesconto,
                    mensagem: 'Cupom aplicado com sucesso!'
                };
            }),
            catchError(error => {
                return of({
                    valido: false,
                    mensagem: error.error?.message || 'Erro ao validar cupom'
                });
            })
        );
    }

    criarCupom(cupom: Cupom): Observable<Cupom> {
        return this.http.post<Cupom>(this.apiUrl, cupom);
    }

    listarCupons(): Observable<Cupom[]> {
        return this.http.get<Cupom[]>(this.apiUrl);
    }
}