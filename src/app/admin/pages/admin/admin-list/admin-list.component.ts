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

import { ViewAdmComponent } from '../view-dialog/view-dialog.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { AdminService } from '../../../../core/services/user/admin.service';
import { Admin } from '../../../../core/models/admin.model';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewAdmComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatPaginatorModule, MatFormFieldModule,
    MatIconModule, MatTableModule],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.css'
})
export class AdminListComponent {
  displayedColumns: string[] = ['id', 'nome', 'email', 'acao'];
  admins: Admin[] = [];

  totalRecords = 6;
  size = 8;
  page = 0;

  adminsSubscription: Subscription | undefined;

  constructor(private dialog: MatDialog,
    private adminService: AdminService) { }

  ngOnInit(): void {
    this.carregarAdmins();
  }

  ngOnDestroy(): void {
    if (this.adminsSubscription) {
      this.adminsSubscription.unsubscribe();
    }
  }

  carregarAdmins(): void {
    this.adminService.findAll(this.page, this.size).subscribe({
      next: (admins) => {
        this.admins = admins;
        console.log('Admins carregados:', admins); // Verifique no console
      },
      error: (err) => {
        console.error('Erro ao carregar admins:', err);
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
      this.adminService.findAll().subscribe(
        data => {
          this.admins = data;
        },
        error => {
          console.error('Erro ao buscar admins:', error);
        }
      );
      return;
    }
    const termoDeBusca = this.searchText.toLowerCase();
    this.adminService.findByNome(termoDeBusca).subscribe(
      data => {
        this.admins = data;
      },
      error => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  confirmDelete(admin: Admin): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && admin && admin.id !== undefined) {

        this.adminService.delete(admin).subscribe(
          () => {
            this.admins = this.admins.filter(adm => adm.id !== admin.id);
          }
        );
      }
    });
  }

  visualizarDados(admin: Admin): void {
    this.dialog.open(ViewAdmComponent, {
      data: admin
    });
    console.log(admin)
  }
}