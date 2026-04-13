import { config } from 'dotenv';

config();

export type AppConfig = {
  baseURL: string;
  apiURL: string;
};

function loadConfig(): AppConfig {
  return {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    apiURL: process.env.API_URL ?? 'http://localhost:3000/api/v1',
  };
}

export const env: AppConfig = loadConfig();
