import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const CONFIG_DIR = '.linq';
const CONFIG_FILE = 'config.json';

export interface Config {
  token?: string;
  sandbox?: {
    phone: string;
    userPhone: string;
    expiresAt: string;
    githubLogin: string;
  };
}

function getHomeDir(): string {
  // Respect HOME env var for testing and Unix convention
  return process.env.HOME || homedir();
}

function getConfigPath(): string {
  return join(getHomeDir(), CONFIG_DIR, CONFIG_FILE);
}

export async function loadConfig(): Promise<Config> {
  const config: Config = {};

  // Try to load from file
  try {
    const path = getConfigPath();
    const data = await readFile(path, 'utf-8');
    const fileConfig = JSON.parse(data) as Config;
    Object.assign(config, fileConfig);
  } catch (error) {
    // File doesn't exist or is invalid - that's OK
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      // Only ignore ENOENT, rethrow other errors
      const parseError = error as SyntaxError;
      if (parseError.name !== 'SyntaxError') {
        throw error;
      }
    }
  }

  // Environment variable overrides file
  const envToken = process.env.LINQ_TOKEN;
  if (envToken) {
    config.token = envToken;
  }

  return config;
}

export async function saveConfig(config: Config): Promise<void> {
  const path = getConfigPath();
  const dir = dirname(path);

  // Create directory with restrictive permissions
  await mkdir(dir, { recursive: true, mode: 0o700 });

  // Write file with restrictive permissions
  const data = JSON.stringify(config, null, 2);
  await writeFile(path, data, { mode: 0o600 });
}

export function requireToken(
  flagToken: string | undefined,
  config: Config
): string {
  const token = flagToken || config.token;
  if (!token) {
    throw new Error("No token found. Run 'linq login' or set LINQ_TOKEN");
  }
  return token;
}
