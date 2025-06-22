import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { AlertComponent } from "../../../shared/components/template/alert/alert.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-adm',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    AlertComponent],
  templateUrl: './login-adm.component.html',
  styleUrls: ['./login-adm.component.css']
})
export class LoginAdmComponent {
  loginForm!: FormGroup;
  alertMessage: string = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verifica se há um token admin não expirado
    if (this.authService.isAdminLoggedIn()) {
      // Se o token for válido, redireciona
      this.router.navigate(['/adm/home']);
      return;
    } else {
      // Se houver token mas estiver expirado, faz logout
      const adminToken = this.authService.getAdminToken();
      if (adminToken && this.authService.isTokenExpired(adminToken)) {
        this.authService.logoutCompleto();
      }
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')!.value;
      const password = this.loginForm.get('password')!.value;

      this.loading = true;

      this.authService.loginADM(email, password).subscribe({
        next: (resp) => {
          this.router.navigateByUrl('/adm/home');
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Usuário ou senha inválidos');
          this.loading = false;
        }
      });
    } else {
      this.showAlert('Por favor, preencha todos os campos corretamente');
    }
  }

  showAlert(message: string) {
    this.alertMessage = message;
    setTimeout(() => this.alertMessage = '', 3000);
  }
}