import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { AlertComponent } from "../../../shared/components/template/alert/alert.component";
import { CommonModule } from '@angular/common';
import { CarrinhoService } from '../../../core/services/order/carrinho.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    AlertComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  alertMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private carrinhoService: CarrinhoService
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
          this.carrinhoService.transferirCarrinhoParaUsuario(resp.id);
          this.carrinhoService.limparCarrinhoEspecifico('anonimo');
          this.router.navigateByUrl('/gameverse/home');
        },
        error: (err) => {
          console.error(err);
          this.showAlert('Usuário ou senha inválidos');
        }
      });
    } else {
      this.showAlert('Por favor, preencha todos os campos corretamente');
    }
  }

  onRegister() {
    this.router.navigate(['/gameverse/cadastro']);
  }

  showAlert(message: string) {
    this.alertMessage = message;
    setTimeout(() => this.alertMessage = '', 3000);
  }
}