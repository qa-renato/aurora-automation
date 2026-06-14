import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Cabeçalho oficial do template (verificado baixando o "Template CSV" da app).
const HEADER = 'nome,cpf,email,departamento,cargo,dataNascimento,telefone,escolaridade,estadoCivil,genero';
export const TEMPLATE_HEADER = HEADER;

function cpfBase(): string {
  const ts = Date.now().toString().slice(-9);
  return `${ts.slice(0, 3)}.${ts.slice(3, 6)}.${ts.slice(6, 9)}`;
}

/**
 * Gera um arquivo CSV de importação VÁLIDO com `qtd` linhas únicas (CPF/e-mail
 * derivados de timestamp) e retorna o caminho + quantidade. Escrito com BOM,
 * como o template oficial. Usado p/ o fluxo de importação bem-sucedida.
 */
export function gerarCsvImportacaoValido(qtd = 2): { path: string; quantidade: number } {
  const id = Date.now();
  const base = cpfBase();
  const depCargo = [
    ['Marketing', 'Analista Júnior'],
    ['Financeiro', 'Analista Pleno'],
    ['Operações', 'Assistente'],
  ];
  const linhas: string[] = [];
  for (let i = 0; i < qtd; i++) {
    const [dep, cargo] = depCargo[i % depCargo.length];
    const suf = i.toString().padStart(2, '0');
    linhas.push(
      `Import QA ${id}-${suf},${base}-${suf},import.qa.${id}.${i}@aurora-demo.com.br,${dep},${cargo},01/01/1990,(11) 99999-0000,Pós-graduação,Solteiro(a),Masculino`,
    );
  }
  const conteudo = '﻿' + HEADER + '\n' + linhas.join('\n') + '\n';
  const file = path.join(os.tmpdir(), `aurora-import-valido-${id}.csv`);
  fs.writeFileSync(file, conteudo, 'utf8');
  return { path: file, quantidade: qtd };
}
