import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { Municipio } from '../../../../core/models/municipio.model';
import { MatDialog } from '@angular/material/dialog';
import { MunicipioService } from '../../../../core/services/utils/municipio.service';
import { Subscription } from 'rxjs';
import { ViewMunicipioComponent } from '../view/view.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewMunicipioComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './municipio-list.component.html',
  styleUrl: './municipio-list.component.css'
})
export class MunicipioListComponent {
  displayedColumns: string[] = ['id', 'nome', 'estado', 'acao'];
  municipios: Municipio[] = [];

  municipiosSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private municipioService: MunicipioService,
    private router: Router) { }

  ngOnInit(): void {
    this.municipiosSubscription = this.municipioService.findAll().subscribe(data => {
      this.municipios = data;
      console.log(data);
    });
  }

  ngOnDestroy(): void {
    if (this.municipiosSubscription) {
      this.municipiosSubscription.unsubscribe();
    }
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
  }
  editar(id: number): void {
    this.router.navigate(['/municipio/edit', id]);
  }
}