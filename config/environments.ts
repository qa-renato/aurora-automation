import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type Environment = 'staging' | 'production' | 'development';

export interface EnvironmentConfig {
  name: Environment;
  baseUrl: string;
  apiUrl: string;
  keycloakUrl: string;
  timeouts: {
    action: number;
    navigation: number;
    expect: number;
  };
}

const environments: Record<Environment, EnvironmentConfig> = {
  staging: {
    name: 'staging',
    baseUrl: 'https://sandbox-inbot-aurora.vercel.app',
    apiUrl: 'https://sandbox-inbot-aurora.vercel.app/api',
    keycloakUrl: 'https://keycloak.staging.e-auth.cloud/realms/stg-inprofile',
    timeouts: {
      action: 15000,
      navigation: 30000,
      expect: 10000,
    },
  },
  production: {
    name: 'production',
    baseUrl: process.env.AURORA_PROD_URL ?? '',
    apiUrl: process.env.AURORA_PROD_API_URL ?? '',
    keycloakUrl: process.env.AURORA_PROD_KEYCLOAK_URL ?? '',
    timeouts: {
      action: 15000,
      navigation: 30000,
      expect: 10000,
    },
  },
  development: {
    name: 'development',
    baseUrl: process.env.AURORA_DEV_URL ?? 'http://localhost:3000',
    apiUrl: process.env.AURORA_DEV_API_URL ?? 'http://localhost:3000/api',
    keycloakUrl: process.env.AURORA_DEV_KEYCLOAK_URL ?? 'http://localhost:8080',
    timeouts: {
      action: 30000,
      navigation: 60000,
      expect: 15000,
    },
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = (process.env.AURORA_ENV ?? 'staging') as Environment;
  const config = environments[env];

  if (!config) {
    const valid = Object.keys(environments).join(', ');
    throw new Error(`Ambiente desconhecido: "${env}". Valores válidos: ${valid}`);
  }

  return config;
}

export default environments;
