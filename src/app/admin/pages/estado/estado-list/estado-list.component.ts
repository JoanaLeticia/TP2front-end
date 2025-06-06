import { Component } from '@angular/core';
import { Estado } from '../../../../core/models/estado.model';
import { MatDialog } from '@angular/material/dialog';
import { EstadoService } from '../../../../core/services/utils/estado.service';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ViewEstadoComponent } from '../view-dialog/view.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewEstadoComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './estado-list.component.html',
  styleUrl: './estado-list.component.css'
})
export class EstadoListComponent {
  displayedColumns: string[] = ['id', 'nome', 'sigla', 'acao'];
  estados: Estado[] = [];

  estadosSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private estadoService: EstadoService) { }

  ngOnInit(): void {
    this.estadosSubscription = this.estadoService.findAll().subscribe(data => {
      this.estados = data;
      console.log(data);
    });
  }

  ngOnDestroy(): void {
    if (this.estadosSubscription) {
      this.estadosSubscription.unsubscribe();
    }
  }

  searchText: string = '';
  search() {
    if (!this.searchText.trim()) {
      this.estadoService.findAll().subscribe(
        data => {
          this.estados = data;
        },
        error => {
          console.error('Erro ao buscar estados:', error);
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
  }
}