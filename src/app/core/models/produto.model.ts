import { Classificacao } from "./classificacao.model";
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
    classificacao!: Classificacao;
    dataLancamento!: string;
    nomeImagem!: string;
}