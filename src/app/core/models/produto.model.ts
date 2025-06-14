import { ClassificacaoIndicativa } from "./classificacao-indicativa.model";
import { Genero } from "./genero.model";
import { Plataforma } from "./plataforma.model";
import { TipoMidia } from "./tipo-midia.model";

export class Produto {
    id!: number;
    nome!: string;
    descricao!: string;
    preco!: number;
    estoque!: number;
    desenvolvedora!: string;
    plataforma!: Plataforma;
    tipoMidia!: TipoMidia;
    genero!: Genero;
    classificacaoIndicativa!: ClassificacaoIndicativa;
    dataLancamento!: string;
    nomeImagem!: string;
}