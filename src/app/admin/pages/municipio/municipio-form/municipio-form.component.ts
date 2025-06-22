import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ErrorComponent } from '../../../components/error/error.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { Estado } from '../../../../core/models/estado.model';
import { EstadoService } from '../../../../core/services/utils/estado.service';
import { Municipio } from '../../../../core/models/municipio.model';
import { MunicipioService } from '../../../../core/services/utils/municipio.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ErrorComponent, CommonModule, MatSelectModule,
    MatOptionModule, RouterModule, NgIf, HeaderComponent,
    NavsideComponent, ReactiveFormsModule, FormsModule,
    NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, ConfirmationDialogComponent],
  templateUrl: './municipio-form.component.html',
  styleUrl: './municipio-form.component.css'
})
export class MunicipioFormComponent implements OnInit {
  municipios: Municipio[] = [];
  estados: Estado[] = [];

  formMunicipio!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private municipioService: MunicipioService,
    private estadoService: EstadoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogError: MatDialog
  ) {
    const municipio: Municipio = this.activatedRoute.snapshot.data['municipio'];
    this.formMunicipio = this.formBuilder.group({
      id: [municipio?.id || null],
      nome: [municipio?.nome || '', Validators.required],
      estado: [municipio?.estado || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.estadoService.findAll().subscribe(data => {
      this.estados = data;
      this.initializeForm();
    });
  }

  initializeForm() {
    const municipio: any = this.activatedRoute.snapshot.data['municipio'];
    const estadoId = municipio && municipio.estado ? municipio.estado.id : null;
    this.formMunicipio = this.formBuilder.group({
      id: [municipio && municipio.id ? municipio.id : null],
      nome: [municipio && municipio.nome ? municipio.nome : '', Validators.required],
      estado: [estadoId]
    });
  }

  salvar() {
    if (this.formMunicipio.valid) {
      const formValue = this.formMunicipio.value;
      const municipioData = {
        id: 0,
        nome: formValue.nome,
        idEstado: formValue.estado
      };

      if (formValue.id == null) {
        this.municipioService.insert(municipioData).subscribe({
          next: () => {
            this.router.navigateByUrl('/municipio/list');
          },
          error: (err) => {
            console.log('Erro ao Incluir' + JSON.stringify(err));
            if (err instanceof HttpErrorResponse && err.error && err.error.errors && err.error.errors.length > 0) {
              const errorMessage = err.error.errors[0].message;
              this.mostrarErro(errorMessage);
            } else {
              this.mostrarErro('Erro ao criar municipio: ' + err.message);
            }
          }
        });
      } else {
        // Similar update for the update case
        this.municipioService.update({
          id: formValue.id,
          nome: formValue.nome,
          estado: formValue.estado
        }).subscribe({
          next: () => {
            this.router.navigateByUrl('/municipio/list');
          },
          error: (err) => {
            console.log('Erro ao Editar' + JSON.stringify(err));
          }
        });
      }
    } else {
      console.log('Formulário inválido');
      this.mostrarErro('Por favor, preencha todos os campos obrigatórios.');
    }
  }


  excluir() {
    if (this.formMunicipio.valid) {
      const municipio = this.formMunicipio.value;
      if (municipio.id != null) {
        this.municipioService.delete(municipio).subscribe({
          next: () => {
            this.router.navigateByUrl('/municipio/list');
          },
          error: (err) => {
            console.log('Erro ao Excluir' + JSON.stringify(err));
          }
        });
      }
    }
  }

  confirmDelete(municipio: Municipio): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true && municipio && municipio.id !== undefined) {
        this.municipioService.delete(municipio).subscribe(
          () => {
            this.municipios = this.municipios.filter(adm => adm.id !== municipio.id);

            this.router.navigateByUrl('/municipio/list');
          },
          error => {
            console.log('Erro ao excluir municipio:', error);
          }
        );
      }
    });
  }

  mostrarErro(mensagemErro: string): void {
    this.dialog.open(ErrorComponent, {
      data: mensagemErro
    });
  }
}