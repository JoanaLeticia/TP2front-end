import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Permite acesso ao login sem validação
  if (state.url === '/admin/login') {
    return true;
  }

  // Aplica o guard apenas para rotas administrativas
  if (state.url.startsWith('/admin')) {
    if (authService.isTokenExpired()) {
      authService.removeToken();
      authService.removeUsuarioLogado();
      router.navigate(['/admin/login']);
      return false;
    }
  }

  return true; // Permite acesso a rotas não administrativas
};
