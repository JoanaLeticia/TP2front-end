import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { AlertComponent } from "../../../shared/components/template/alert/alert.component";
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../../auth/auth.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    AlertComponent,
    NgxMaskDirective
  ],
  providers: [provideNgxMask()],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {
  registerForm!: FormGroup;
  alertMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.minLength(11), Validators.maxLength(11)]],
      dataNascimento: [''],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.minLength(11), Validators.maxLength(11)]],
      dataNascimento: [''],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get('senha')?.value === formGroup.get('confirmarSenha')?.value
      ? null : { mismatch: true };
  }

  // cadastro.component.ts
  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      const registerRequest: RegisterRequest = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento
      };

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.router.navigate(['/gameverse/login']); // Redireciona após cadastro
        },
        error: (err) => {
          this.showAlert('Erro no cadastro: ' + err.error?.message);
        }
      });
    }
  }

  onLogin() {
    this.router.navigate(['/gameverse/login']);
  }

  showAlert(message: string) {
    this.alertMessage = message;
    setTimeout(() => this.alertMessage = '', 3000);
  }
}