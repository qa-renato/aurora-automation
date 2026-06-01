import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface Credentials {
  email: string;
  password: string;
}

export function getCredentials(): Credentials {
  const email = process.env.AURORA_EMAIL;
  const password = process.env.AURORA_PASSWORD;

  if (!email || email.trim() === '') {
    throw new Error(
      'Variável de ambiente AURORA_EMAIL não configurada.\n' +
        'Configure seu arquivo .env antes de executar os testes.'
    );
  }

  if (!password || password.trim() === '') {
    throw new Error(
      'Variável de ambiente AURORA_PASSWORD não configurada.\n' +
        'Configure seu arquivo .env antes de executar os testes.'
    );
  }

  return { email: email.trim(), password };
}

export function getAdminCredentials(): Credentials {
  const email = process.env.AURORA_ADMIN_EMAIL;
  const password = process.env.AURORA_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Variáveis AURORA_ADMIN_EMAIL ou AURORA_ADMIN_PASSWORD não configuradas no .env.'
    );
  }

  return { email: email.trim(), password };
}
