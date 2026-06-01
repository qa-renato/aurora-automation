import { ColaboradorData } from '../pages/ColaboradoresPage';

// CPF único por execução — evita colisão com dados existentes
function cpfUnico(): string {
  const ts = Date.now().toString().slice(-9);
  return `${ts.slice(0, 3)}.${ts.slice(3, 6)}.${ts.slice(6, 9)}-00`;
}

export function novoColaboradorValido(): ColaboradorData {
  return {
    nome: 'QA Automation Teste',
    cpf: cpfUnico(),
    email: `qa.automation.${Date.now()}@aurora-demo.com.br`,
    dataNascimento: '15/03/1990',
    departamento: 'Tecnologia da Informação',
    cargo: 'Desenvolvedor',
    telefone: '(11) 99999-0000',
  };
}

// CPF já existente na base — para testes negativos
export const colaboradorCpfDuplicado: ColaboradorData = {
  nome: 'Teste CPF Duplicado',
  cpf: '234.567.890-11', // CPF do Bruno Henrique Souza (existente na base)
  email: 'cpf.duplicado@aurora-demo.com.br',
  dataNascimento: '01/01/1985',
  departamento: 'Financeiro',
  cargo: 'Analista Júnior',
};
