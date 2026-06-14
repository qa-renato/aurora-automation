import { ColaboradorData } from '../pages/ColaboradoresPage';

// ─── Geração de CPF ───────────────────────────────────────────────────────────
// A aplicação valida o dígito verificador (DV) do CPF. Geramos CPFs com DV
// CORRETO para cadastros válidos e, quando necessário, um CPF com DV inválido
// (mas formato ok) para testar a rejeição.

function calcularDV(base: number[]): [number, number] {
  const dv = (nums: number[]): number => {
    const peso0 = nums.length + 1;
    const soma = nums.reduce((acc, n, i) => acc + n * (peso0 - i), 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(base);
  const d2 = dv([...base, d1]);
  return [d1, d2];
}

// 9 dígitos-base "únicos por execução" (timestamp + ruído), nunca todos iguais.
function gerarBase9(): number[] {
  const semente = (Date.now() + Math.floor(Math.random() * 100000)).toString();
  const nums = semente.slice(-9).split('').map(Number);
  while (nums.length < 9) nums.unshift(Math.floor(Math.random() * 10));
  if (nums.every((n) => n === nums[0])) nums[0] = (nums[0] + 1) % 10; // evita 111.111.111
  return nums;
}

function formatar(digitos: number[]): string {
  const s = digitos.join('');
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
}

/** CPF com dígito verificador VÁLIDO e único por execução. */
export function cpfUnico(): string {
  const base = gerarBase9();
  const [d1, d2] = calcularDV(base);
  return formatar([...base, d1, d2]);
}

/** CPF com formato correto (11 dígitos) mas dígito verificador INVÁLIDO. */
export function cpfInvalido(): string {
  const base = gerarBase9();
  const [d1, d2] = calcularDV(base);
  return formatar([...base, d1, (d2 + 1) % 10]); // DV2 deliberadamente errado
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
