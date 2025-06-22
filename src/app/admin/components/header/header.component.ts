import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isListVisible = false;
  usuarioLogado$: Observable<Usuario | null>;

  logHome() {
    this.router.navigate(['/adm/home']);
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.usuarioLogado$ = this.authService.getUsuarioLogado();
  }

  ngOnInit(): void { }

  toggleList() {
    this.isListVisible = !this.isListVisible;
  }

  logout(): void {
    const usuario = this.authService.getUsuariologadoSnapshot();

    this.authService.logoutCompleto();

    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/adm')) {
      this.router.navigate(['/adm/login']);
    } else {
      this.router.navigate(['/gameverse/home']);
    }
  }
}