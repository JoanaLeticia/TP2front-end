import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { ViewClienteComponent } from '../view/view.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ClienteService } from '../../../../core/services/user/cliente.service';
import { Cliente } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewClienteComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent {
  displayedColumns: string[] = ['id', 'nome', 'email', 'cpf', 'acao'];
  clientes: Cliente[] = [];

  totalRecords = 0;
  pageSize = 10;
  page = 0;

  clientesSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.carregarClientes();
  }

  ngOnDestroy(): void {
    if (this.clientesSubscription) {
      this.clientesSubscription.unsubscribe();
    }
  }

  carregarClientes(): void {
    this.clienteService.findAll(this.page, this.pageSize).subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        console.log('Clientes carregados:', clientes); // Verifique no console
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
      }
    });
  }

  searchText: string = '';
  search() {
    if (!this.searchText.trim()) {
      this.clienteService.findAll().subscribe(
        data => {
          this.clientes = data;
        },
        error => {
          console.error('Erro ao buscar clientes:', error);
        }
      );
      return;
    }
    const termoDeBusca = this.searchText.toLowerCase();
    this.clienteService.findByNome(termoDeBusca).subscribe(
      data => {
        this.clientes = data;
      },
      error => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  confirmDelete(cliente: Cliente): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && cliente && cliente.id !== undefined) {

        this.clienteService.delete(cliente).subscribe(
          () => {
            this.clientes = this.clientes.filter(adm => adm.id !== cliente.id);
          }
        );
      }
    });
  }

  visualizarDados(cliente: Cliente): void {
    this.dialog.open(ViewClienteComponent, {
      data: cliente
    });
    console.log(cliente)
  }
}