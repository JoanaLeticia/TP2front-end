import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LocalStorageService } from '../core/services/local-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Usuario } from '../core/models/usuario.model';

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  dataNascimento?: string;
}

export interface RegisterResponse {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL: string = 'http://localhost:8080/auth';
  private tokenKey = 'jwt_token';
  private usuarioLogadoKey = 'usuario_logado';
  private usuarioLogadoSubject = new BehaviorSubject<Usuario | null>(null);

  constructor(private http: HttpClient,
    private localStorageService: LocalStorageService,
    private jwtHelper: JwtHelperService) {

    this.initUsuarioLogado();

  }

  private initUsuarioLogado() {
    const usuario = this.localStorageService.getItem(this.usuarioLogadoKey);
    if (usuario) {
      const usuarioLogado = usuario;

      this.setUsuarioLogado(usuarioLogado);
      this.usuarioLogadoSubject.next(usuarioLogado);
    }
  }


  login(email: string, senha: string): Observable<any> {
    const params = {
      login: email,
      senha: senha,
      perfil: 'CLIENTE'
    }

    return this.http.post(`${this.baseURL}`, params, { observe: 'response' }).pipe(
      tap((res: any) => {
        const authToken = res.headers.get('Authorization') ?? '';
        if (authToken) {
          this.setToken(authToken);
          const usuarioLogado = res.body;

          if (usuarioLogado) {
            this.setUsuarioLogado(usuarioLogado);
            this.usuarioLogadoSubject.next(usuarioLogado);
          }
        }
      })
    )
  }

  loginADM(email: string, senha: string): Observable<any> {
    const params = {
      login: email,
      senha: senha,
      perfil: 'ADMIN'
    }

    return this.http.post(`${this.baseURL}`, params, { observe: 'response' }).pipe(
      tap((res: any) => {
        const authToken = res.headers.get('Authorization') ?? '';
        if (authToken) {
          this.setToken(authToken);
          const usuarioLogado = res.body;

          if (usuarioLogado) {
            this.setUsuarioLogado(usuarioLogado);
            this.usuarioLogadoSubject.next(usuarioLogado);
          }
        }
      })
    )
  }

  setUsuarioLogado(usuario: Usuario): void {
    this.localStorageService.setItem(this.usuarioLogadoKey, usuario);
  }

  setToken(token: string): void {
    this.localStorageService.setItem(this.tokenKey, token);
  }

  getUsuarioLogado() {
    return this.usuarioLogadoSubject.asObservable();
  }

  getToken(): string | null {
    return this.localStorageService.getItem(this.tokenKey);
  }

  removeToken(): void {
    this.localStorageService.removeItem(this.tokenKey);
  }

  removeUsuarioLogado(): void {
    this.localStorageService.removeItem(this.usuarioLogadoKey);
    this.usuarioLogadoSubject.next(null);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log(true);
      return true;
    }

    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error("Token inválido", error);
      return true;
    }

  }

  register(cliente: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseURL}/registrar`, cliente);
  }

  // isTokenExpired(): boolean {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     return true;
  //   }

  //   try {
  //     return this.jwtHelper.isTokenExpired(token);
  //   } catch (error) {
  //     console.error('Token inválido:', error);
  //     return true; 
  //   }
  // }

}