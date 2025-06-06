import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';

import { AdminService } from '../../../../core/services/user/admin.service';
import { Admin } from '../../../../core/models/admin.model';

import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { ViewAdmComponent } from '../view-dialog/view-dialog.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterModule, ViewAdmComponent, ConfirmationDialogComponent, ReactiveFormsModule, FormsModule,
    HeaderComponent, NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, MatTableModule, MatPaginatorModule],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.css'
})
export class AdminListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'nome', 'acao'];
  admins: Admin[] = [];
  adminsSubscription: Subscription | undefined;

  totalRecords = 0;
  pageSize = 10;
  page = 0;
  searchText: string = '';

  constructor(private dialog: MatDialog,
    private adminService: AdminService) { }

  ngOnInit(): void {
    this.adminService.findAll(this.page, this.pageSize).subscribe(data => {
      this.admins = data;
      console.log(this.admins);
    });

    this.adminService.count().subscribe(data => {
      this.totalRecords = data;
      console.log(this.admins);
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ngOnInit();
  }

  ngOnDestroy(): void {
    if (this.adminsSubscription) {
      this.adminsSubscription.unsubscribe();
    }
  }

  search() {
    if (!this.searchText.trim()) {
      this.adminService.findAll().subscribe(
        data => {
          this.admins = data;
        },
        error => {
          console.error('Erro ao buscar administradores:', error);
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
  }
}