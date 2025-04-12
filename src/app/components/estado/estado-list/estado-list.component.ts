import { Component, OnInit } from '@angular/core';
import { Estado } from '../../../models/estado.model';
import { EstadoService } from '../../../services/estado.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getPtBrPaginatorIntl } from '../../../shared/utils/pt-br-paginator';

@Component({
  selector: 'app-estado-list',
  standalone: true,
  imports: [
    MatPaginatorModule, 
    RouterLink, 
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './estado-list.component.html',
  styleUrl: './estado-list.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getPtBrPaginatorIntl() }
  ]
})
export class EstadoListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'sigla', 'acao'];
  estados: Estado[] = [];
  termoPesquisa = '';
  ordenacao = 'id';
  
  pageSize = 2;
  page = 0;
  totalRecords = 0;
  totalPages = 0;

  private searchSubject = new Subject<string>();

  constructor(private estadoService: EstadoService) { }

  ngOnInit(): void {
    this.carregarDados();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.carregarDados();
    });
  }

  carregarDados(): void {
    let sortParam = this.ordenacao === 'nome_asc' ? 'nome' : 
                   this.ordenacao === 'nome_desc' ? 'nome desc' : 'id';

    if (this.termoPesquisa) {
      this.estadoService.findByNome(this.termoPesquisa, this.page, this.pageSize, sortParam)
        .subscribe(response => {
          this.estados = response.dados;
          this.totalRecords = response.totalRegistros;
          this.totalPages = response.totalPaginas;
        });
    } else {
      this.estadoService.findAll(this.page, this.pageSize, sortParam)
        .subscribe(response => {
          this.estados = response.dados;
          this.totalRecords = response.totalRegistros;
          this.totalPages = response.totalPaginas;
        });
    }
  }

  pesquisar(): void {
    this.searchSubject.next(this.termoPesquisa);
  }

  aplicarOrdenacao(): void {
    this.carregarDados();
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarDados();
  }
}