import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavsideComponent } from "../../../components/navside/navside.component";
import { HeaderComponent } from "../../../components/header/header.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ErrorComponent } from '../../../components/error/error.component';
import { CommonModule, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Produto } from '../../../../core/models/produto.model';
import { ProdutoService } from '../../../../core/services/product/produto.service';
import { Plataforma } from '../../../../core/models/plataforma.model';
import { TipoMidia } from '../../../../core/models/tipo-midia.model';
import { Genero } from '../../../../core/models/genero.model';
import { Classificacao } from '../../../../core/models/classificacao.model';

@Component({
  selector: 'app-form',
  standalone: true,
  templateUrl: './produto-form.component.html',
  styleUrl: './produto-form.component.css',
  imports: [ErrorComponent, CommonModule, MatSelectModule, MatOptionModule, RouterModule, NgIf, HeaderComponent, NavsideComponent, ReactiveFormsModule, FormsModule,
    NavsideComponent, MatInputModule, MatFormFieldModule, MatIconModule, ConfirmationDialogComponent]
})
export class ProdutoFormComponent {
  produtos: Produto[] = [];
  plataformas: Plataforma[] = [];
  tiposMidia: TipoMidia[] = [];
  generos: Genero[] = [];
  classificacoes: Classificacao[] = [];

  formProduto!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dialogError: MatDialog
  ) {
    const produto: Produto = this.activatedRoute.snapshot.data['produto'];
    this.formProduto = this.formBuilder.group({
      id: [produto?.id || null],
      nome: [produto?.nome || '', Validators.required],
      descricao: [produto?.descricao || '', Validators.required],
      preco: [produto?.preco || '', Validators.required],
      estoque: [produto?.estoque || '', Validators.required],
      desenvolvedora: [produto?.desenvolvedora || '', Validators.required],
      plataforma: [null],
      tipoMidia: [produto?.tipoMidia || '', Validators.required],
      genero: [produto?.genero || '', Validators.required],
      classificacao: [produto?.classificacao || '', Validators.required],
    });
  }

  ngOnInit(): void {
    this.produtoService.findPlataformas().subscribe(data => {
      this.plataformas = data;
      this.initializeForm();
    });
    this.produtoService.findTiposMidia().subscribe(data => {
      this.tiposMidia = data;
      this.initializeForm();
    });
    this.produtoService.findGeneros().subscribe(data => {
      this.generos = data;
      this.initializeForm();
    });
    this.produtoService.findClassificacoes().subscribe(data => {
      this.classificacoes = data;
      this.initializeForm();
    });
  }

  initializeForm(): void {
    const produto: Produto = this.activatedRoute.snapshot.data['produto'];

    const plataforma = this.plataformas.find(m => m.id === (produto?.plataforma?.id || null));

    const tipoMidia = this.tiposMidia.find(m => m.id === (produto?.tipoMidia?.id || null));

    const genero = this.generos.find(m => m.id === (produto?.genero?.id || null));

    const classificacao = this.classificacoes.find(m => m.id === (produto?.classificacao?.id || null));

    this.formProduto = this.formBuilder.group({
      id: [(produto && produto.id) ? produto.id : null],
      nome: [(produto && produto.nome) ? produto.nome : null],
      descricao: [(produto && produto.descricao) ? produto.descricao : null],
      preco: [(produto && produto.preco) ? produto.preco : null],
      estoque: [(produto && produto.estoque) ? produto.estoque : null],
      desenvolvedora: [(produto && produto.desenvolvedora) ? produto.desenvolvedora : null],
      plataforma: [plataforma],
      tipoMidia: [tipoMidia],
      genero: [genero],
      classificacao: [classificacao]
    })

  }

  salvar() {
    console.log('Entrou no salvar');
    console.log('Formulário:', this.formProduto.value);
    console.log('Formulário válido:', this.formProduto.valid);

    // Validar o formulário antes de prosseguir
    this.enviarFormulario();

    if (this.formProduto.valid) {
      const produto = this.formProduto.value;
      if (produto.id == null) {
        this.produtoService.insert(produto).subscribe({
          next: (produtoService) => {
            this.router.navigateByUrl('/produtos/list');
          },
          error: (err) => {
            console.log('Erro ao Incluir' + JSON.stringify(err));
            if (err instanceof HttpErrorResponse && err.error && err.error.errors && err.error.errors.length > 0) {
              const errorMessage = err.error.errors[0].message;
              this.mostrarErro(errorMessage);
            } else {
              this.mostrarErro('Erro ao criar produto: ' + err.message);
            }
          }
        });
      } else {
        this.produtoService.update(produto).subscribe({
          next: (produtoService) => {
            this.router.navigateByUrl('/produtos/list');
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
    if (this.formProduto.valid) {
      const produto = this.formProduto.value;
      if (produto.id != null) {
        this.produtoService.delete(produto).subscribe({
          next: () => {
            this.router.navigateByUrl('/produtos/list');
          },
          error: (err) => {
            console.log('Erro ao Excluir' + JSON.stringify(err));
          }
        });
      }
    }
  }

  confirmDelete(produto: Produto): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true && produto && produto.id !== undefined) {
        this.produtoService.delete(produto).subscribe(
          () => {
            // Atualizar lista de administradores após exclusão
            this.produtos = this.produtos.filter(adm => adm.id !== produto.id);

            this.router.navigateByUrl('/produtos/list');
          },
          error => {
            console.log('Erro ao excluir modelo:', error);
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

  enviarFormulario(): void {


  }
}