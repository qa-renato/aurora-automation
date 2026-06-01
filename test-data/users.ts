import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export const testUsers = {
  admin: {
    email: process.env.AURORA_EMAIL ?? '',
    password: process.env.AURORA_PASSWORD ?? '',
    name: 'Renato Paulino',
    role: 'admin' as UserRole,
  },
} satisfies Record<string, TestUser>;

export type TestUserKey = keyof typeof testUsers;

export function getTestUser(key: TestUserKey): TestUser {
  const user = testUsers[key];

  if (!user.email || !user.password) {
    throw new Error(
      `Usuário de teste "${key}" não tem credenciais configuradas. Verifique o .env.`
    );
  }

  return user;
}

// Dados de usuário inválidos para testes negativos (não precisam vir do .env)
export const invalidUsers = {
  wrongPassword: {
    email: process.env.AURORA_EMAIL ?? 'test@aurora.com',
    password: 'SenhaErrada@999',
    name: 'Usuário Senha Errada',
    role: 'viewer' as UserRole,
  },
  nonExistentUser: {
    email: 'usuario.inexistente@aurora.com',
    password: 'Qualquer@123',
    name: 'Usuário Inexistente',
    role: 'viewer' as UserRole,
  },
};
