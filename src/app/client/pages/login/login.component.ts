import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../auth/auth.service'; // Importa serviço de autenticação
import { NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { AlertComponent } from "../../../shared/components/template/alert/alert.component";

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [NgIf, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatCardModule, MatToolbarModule,
    RouterModule, AlertComponent]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  alertMessage: string = '';
  showAlert$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')!.value;
      const password = this.loginForm.get('password')!.value;

      this.authService.login(email, password).subscribe({
        next: (resp) => {
          this.router.navigateByUrl('gameverse/home');
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Usuário ou senha inválidos');
        },
      });
    } else {
      this.showAlert('Dados inválidos');
    }
  }

  onRegister() {
    this.router.navigate(['/gameverse/cadastro']);
  }

  showAlert(message: string) {
    this.alertMessage = message;
    this.showAlert$.next();

    setTimeout(() => {
      this.alertMessage = '';
    }, 2000);
  }
}