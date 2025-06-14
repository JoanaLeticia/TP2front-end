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
  pageSize = 10;
  page = 0;

  municipiosSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private municipioService: MunicipioService) { }

  ngOnInit(): void {
    this.carregarMunicipios();
  }

  ngOnDestroy(): void {
    if (this.municipiosSubscription) {
      this.municipiosSubscription.unsubscribe();
    }
  }

  carregarMunicipios(): void {
    this.municipioService.findAll(this.page, this.pageSize).subscribe({
      next: (municipios) => {
        this.municipios = municipios;
        console.log('Municipios carregados:', municipios); // Verifique no console
      },
      error: (err) => {
        console.error('Erro ao carregar municipios:', err);
      }
    });
  }

  paginar(event: PageEvent) : void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
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
          console.error('Erro ao buscar municipios:', error);
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && municipio && municipio.id !== undefined) {

        this.municipioService.delete(municipio).subscribe(
          () => {
            this.municipios = this.municipios.filter(adm => adm.id !== municipio.id);
          }
        );
      }
    });
  }

  visualizarDados(municipio: Municipio): void {
    this.dialog.open(ViewMunicipioComponent, {
      data: municipio
    });
    console.log(municipio)
  }
}