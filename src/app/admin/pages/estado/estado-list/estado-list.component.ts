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

import { ViewEstadoComponent } from '../view-dialog/view.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { EstadoService } from '../../../../core/services/utils/estado.service';
import { Estado } from '../../../../core/models/estado.model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewEstadoComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatPaginatorModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './estado-list.component.html',
  styleUrl: './estado-list.component.css'
})
export class EstadoListComponent {
  displayedColumns: string[] = ['id', 'nome', 'sigla', 'acao'];
  estados: Estado[] = [];

  totalRecords = 10;
  size = 8;
  page = 0;

  estadosSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private estadoService: EstadoService) { }

  ngOnInit(): void {
    this.carregarEstados();
  }

  ngOnDestroy(): void {
    if (this.estadosSubscription) {
      this.estadosSubscription.unsubscribe();
    }
  }

  carregarEstados(): void {
    this.estadoService.findAll(this.page, this.size).subscribe({
      next: (estados) => {
        this.estados = estados;
        console.log('Estados carregados:', estados);
        
        if (estados.length > 0 || this.page === 0) {
          this.estadoService.count().subscribe(
            data => {
              this.totalRecords = data;
              const totalPages = Math.ceil(this.totalRecords / this.size);
            },
            error => {
              console.error('Erro ao contar produtos:', error);
            }
          );
        } else {
          this.totalRecords = 0;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar estados:', err);
      }
    });
  }

  paginar(event: PageEvent) : void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.ngOnInit();
  }

  searchText: string = '';
  search() {
    if (!this.searchText.trim()) {
      this.estadoService.findAll().subscribe(
        data => {
          this.estados = data;
        },
        error => {
          console.error('Erro ao buscar produtos:', error);
        }
      );
      return;
    }
    const termoDeBusca = this.searchText.toLowerCase();
    this.estadoService.findByNome(termoDeBusca).subscribe(
      data => {
        this.estados = data;
      },
      error => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  confirmDelete(estado: Estado): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && estado && estado.id !== undefined) {

        this.estadoService.delete(estado).subscribe(
          () => {
            this.estados = this.estados.filter(adm => adm.id !== estado.id);
          }
        );
      }
    });
  }

  visualizarDados(estado: Estado): void {
    this.dialog.open(ViewEstadoComponent, {
      data: estado
    });
    console.log(estado)
  }
}