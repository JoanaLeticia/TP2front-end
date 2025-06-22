import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ViewMunicipioComponent } from '../view/view.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { MunicipioService } from '../../../../core/services/utils/municipio.service';
import { Municipio } from '../../../../core/models/municipio.model';
import { ErrorComponent } from '../../../components/error/error.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewMunicipioComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatPaginatorModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './municipio-list.component.html',
  styleUrl: './municipio-list.component.css'
})
export class MunicipioListComponent {
  displayedColumns: string[] = ['id', 'nome', 'estado', 'acao'];
  municipios: Municipio[] = [];

  totalRecords = 0;
  size = 10;
  page = 0;

  municipiosSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private municipioService: MunicipioService,  private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.carregarMunicipios();
  }

  ngOnDestroy(): void {
    if (this.municipiosSubscription) {
      this.municipiosSubscription.unsubscribe();
    }
  }

  carregarMunicipios(): void {
    this.municipioService.findAll(this.page, this.size).subscribe({
      next: (municipios) => {
        this.municipios = municipios;
        console.log('Municipios carregados:', municipios); // Verifique no console
      },
      error: (err) => {
        console.error('Erro ao carregar municipios:', err);
      }
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.ngOnInit();
  }

  searchText: string = '';
  search() {
    if (!this.searchText.trim()) {
      this.municipioService.findAll().subscribe(
        data => {
          this.municipios = data;
        },
        error => {
          console.error('Erro ao buscar admins:', error);
        }
      );
      return;
    }
    const termoDeBusca = this.searchText.toLowerCase();
    this.municipioService.findByNome(termoDeBusca).subscribe(
      data => {
        this.municipios = data;
      },
      error => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  confirmDelete(municipio: Municipio): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o município ${municipio.nome}?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && municipio && municipio.id !== undefined) {
        this.municipioService.delete(municipio).subscribe({
          next: () => {
            this.showSuccess('Município excluído com sucesso!');
            this.municipios = this.municipios.filter(m => m.id !== municipio.id);
          },
          error: (err) => {
            if (err.status === 409) {
              // Conflito - município vinculado a endereços
              this.showError(err.error.message ||
                'Não é possível excluir o município pois está vinculado a endereços.');
            } else if (err.status === 404) {
              // Município não encontrado
              this.showError('Município não encontrado.');
            } else {
              // Outros erros
              this.showError('Erro ao excluir município: ' +
                (err.error?.message || err.message || 'Erro desconhecido'));
            }
          }
        });
      }
    });
  }

  private showError(message: string): void {
    this.dialog.open(ErrorComponent, {
      data: {
        title: 'Erro',
        message: message,
        isError: true
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  visualizarDados(municipio: Municipio): void {
    this.dialog.open(ViewMunicipioComponent, {
      data: municipio
    });
    console.log(municipio)
  }
}