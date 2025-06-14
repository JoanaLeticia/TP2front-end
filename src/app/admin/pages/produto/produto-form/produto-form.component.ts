import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Produto } from '../../../../core/models/produto.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProdutoService } from '../../../../core/services/product/produto.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, NgIf, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { ErrorComponent } from '../../../components/error/error.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { NavsideComponent } from '../../../components/navside/navside.component';
import { Plataforma } from '../../../../core/models/plataforma.model';
import { TipoMidia } from '../../../../core/models/tipo-midia.model';
import { Genero } from '../../../../core/models/genero.model';
import { Classificacao } from '../../../../core/models/classificacao.model';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ErrorComponent, CommonModule, MatSelectModule,
    MatOptionModule, RouterModule, NgIf, HeaderComponent,
    NavsideComponent, ReactiveFormsModule, FormsModule,
    NavsideComponent, MatInputModule, MatFormFieldModule,
    MatIconModule, ConfirmationDialogComponent, MatCardModule, MatToolbarModule],
  templateUrl: './produto-form.component.html',
  styleUrl: './produto-form.component.css'
})
export class ProdutoFormComponent implements OnInit {
  formGroup: FormGroup;
  plataformas: Plataforma[] = [];
  tiposMidia: TipoMidia[] = [];
  generos: Genero[] = [];
  classificacoes: Classificacao[] = [];

  fileName: string = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    this.formGroup = this.formBuilder.group({
      id: [null],
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      preco: ['', Validators.required],
      estoque: ['', Validators.required],
      desenvolvedora: ['', Validators.required],
      plataforma: [null],
      tipoMidia: [null],
      genero: [null],
      classificacao: [null],
      dataLancamento: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.produtoService.findPlataformas().subscribe(
      data => {
        this.plataformas = data;
        this.initializeForm();
      });

    this.produtoService.findTiposMidia().subscribe(
      data => {
        this.tiposMidia = data;
        this.initializeForm();
      });

    this.produtoService.findGeneros().subscribe(
      data => {
        this.generos = data;
        this.initializeForm();
      });

    this.produtoService.findClassificacoes().subscribe(
      data => {
        this.classificacoes = data;
        this.initializeForm();
      });
  }

  voltarPagina() {
    this.location.back();
  }

  initializeForm(): void {
    const produto: Produto = this.activatedRoute.snapshot.data['produto'];

    const plataforma = this.plataformas.find(p => p.id === (produto?.plataforma?.id || null));

    const tipoMidia = this.tiposMidia.find(t => t.id === (produto?.tipoMidia?.id || null));

    const genero = this.generos.find(g => g.id === (produto?.genero?.id || null));

    const classificacao = this.classificacoes.find(c => c.id === (produto?.classificacao?.id || null));

    if (produto && produto.nomeImagem) {
      this.imagePreview = this.produtoService.getUrlImagem(produto.nomeImagem);
      this.fileName = produto.nomeImagem;
    }

    this.formGroup = this.formBuilder.group({
      id: [(produto && produto.id) ? produto.id : null],
      nome: [(produto && produto.nome) ? produto.nome : null],
      descricao: [(produto && produto.descricao) ? produto.descricao : null],
      preco: [(produto && produto.preco) ? produto.preco : null],
      estoque: [(produto && produto.estoque) ? produto.estoque : null],
      desenvolvedora: [(produto && produto.desenvolvedora) ? produto.desenvolvedora : null],
      plataforma: [plataforma],
      tipoMidia: [tipoMidia],
      genero: [genero],
      classificacao: [classificacao],
      dataLancamento: [(produto && produto.dataLancamento) ? produto.dataLancamento : null],
    })
  }

  tratarErros(errorResponse: HttpErrorResponse) {

    if (errorResponse.status === 400) {
      if (errorResponse.error?.errors) {
        errorResponse.error.errors.forEach((validationError: any) => {
          const formControl = this.formGroup.get(validationError.fieldName);

          if (formControl) {
            formControl.setErrors({ apiError: validationError.message })
          }

        });
      }
    } else if (errorResponse.status < 400) {
      alert(errorResponse.error?.message || 'Erro genérico do envio do formulário.');
    } else if (errorResponse.status >= 500) {
      alert('Erro interno do servidor.');
    }

  }

  carregarImagemSelecionada(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      this.fileName = this.selectedFile.name;
      // carregando image preview
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }

  }

  private uploadImage(produtoId: number) {
    if (this.selectedFile) {
      this.produtoService.uploadImagem(produtoId, this.selectedFile.name, this.selectedFile)
        .subscribe({
          next: () => {
            this.voltarPagina();
          },
          error: err => {
            console.log('Erro ao fazer o upload da imagem');
            // tratar o erro
          }
        })
    } else {
      this.voltarPagina();
    }
  }

  salvar() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      const formValue = this.formGroup.value;
      // Criar objeto no formato que o backend espera
      const produtoParaEnviar = {
        id: formValue.id,
        nome: formValue.nome,
        descricao: formValue.descricao,
        preco: formValue.preco,
        estoque: formValue.estoque,
        desenvolvedora: formValue.desenvolvedora,
        idPlataforma: formValue.plataforma?.id,
        idTipoMidia: formValue.tipoMidia?.id,
        idGenero: formValue.genero?.id,
        idClassificacao: formValue.classificacao?.id,
        dataLancamento: formValue.dataLancamento
      };

      console.log(produtoParaEnviar);

      const operacao = produtoParaEnviar.id == null
        ? this.produtoService.insert(produtoParaEnviar)
        : this.produtoService.update(produtoParaEnviar);

      // executando a operacao
      operacao.subscribe({
        next: (produtoCadastrado) => {
          const produtoId = produtoParaEnviar.id || produtoCadastrado?.id;

          if(!produtoId) {
            throw new Error('Resposta inválida da API: ID não retornado.');
          }
          this.uploadImage(produtoId);
          this.router.navigateByUrl('/produtos/list');
        },
        error: (error) => {
          console.log('Erro ao Salvar' + JSON.stringify(error));
          this.tratarErros(error);
        }
      });
    }
  }

  getErrorMessage(controlName: string, errors: ValidationErrors | null | undefined): string {
    if (!errors) {
      return '';
    }
    for (const errorName in errors) {
      if (errors.hasOwnProperty(errorName) && this.errorMessages[controlName][errorName]) {
        return this.errorMessages[controlName][errorName];
      }
    }

    return 'invalid field';
  }

  errorMessages: { [controlName: string]: { [errorName: string]: string } } = {
    nome: {
      required: 'O nome deve ser informado.',
      minlength: 'O nome deve conter ao menos 2 letras.',
      maxlength: 'O nome deve conter no máximo 10 letras.',
      apiError: ' '
    },

    descricao: {
      required: 'A descricao deve ser informada.',
      minlength: 'O nome deve conter 2 letras.',
      maxlength: 'O nome deve conter 2 letras.',
      apiError: ' '
    },
    preco: {
      required: 'O preço deve ser informado.',
      apiError: ' '
    },
    estoque: {
      required: 'O estoque deve ser informado.',
      apiError: ' '
    }
  }

  excluir() {
    if (this.formGroup.valid) {
      const produto = this.formGroup.value;
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
}