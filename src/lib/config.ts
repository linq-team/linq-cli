import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const CONFIG_DIR = '.linq';
const CONFIG_FILE = 'config.json';

export interface Profile {
  token?: string;
  sandbox?: {
    phone: string;
    userPhone: string;
    expiresAt: string;
    githubLogin: string;
  };
  ngrokAuthtoken?: string;
  fromPhone?: string;
}

export interface ConfigFile {
  profile: string;
  profiles: Record<string, Profile>;
}

export type Config = Profile;

function getHomeDir(): string {
  return process.env.HOME || homedir();
}

function getConfigPath(): string {
  return join(getHomeDir(), CONFIG_DIR, CONFIG_FILE);
}

function createEmptyConfigFile(): ConfigFile {
  return {
    profile: 'default',
    profiles: {
      default: {},
    },
  };
}

export async function loadConfigFile(): Promise<ConfigFile> {
  try {
    const path = getConfigPath();
    const data = await readFile(path, 'utf-8');
    const parsed = JSON.parse(data) as ConfigFile;

    // Ensure structure is valid
    if (!parsed.profiles) {
      return createEmptyConfigFile();
    }

    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      const parseError = error as SyntaxError;
      if (parseError.name !== 'SyntaxError') {
        throw error;
      }
    }
    return createEmptyConfigFile();
  }
}

export async function saveConfigFile(configFile: ConfigFile): Promise<void> {
  const path = getConfigPath();
  const dir = dirname(path);

  await mkdir(dir, { recursive: true, mode: 0o700 });
  const data = JSON.stringify(configFile, null, 2);
  await writeFile(path, data, { mode: 0o600 });
}

export async function loadConfig(profileName?: string): Promise<Config> {
  const configFile = await loadConfigFile();

  // Determine which profile to use
  const envProfile = process.env.LINQ_PROFILE;
  const targetProfile = profileName || envProfile || configFile.profile;

  if (!configFile.profiles[targetProfile]) {
    throw new Error(
      `Profile "${targetProfile}" not found. Available: ${Object.keys(configFile.profiles).join(', ')}`
    );
  }

  const config: Config = { ...configFile.profiles[targetProfile] };

  // Environment variables override profile settings
  if (process.env.LINQ_TOKEN) {
    config.token = process.env.LINQ_TOKEN;
  }
  if (process.env.NGROK_AUTHTOKEN) {
    config.ngrokAuthtoken = process.env.NGROK_AUTHTOKEN;
  }
  if (process.env.LINQ_FROM_PHONE) {
    config.fromPhone = process.env.LINQ_FROM_PHONE;
  }

  return config;
}

export async function saveConfig(config: Config): Promise<void> {
  const configFile = await loadConfigFile();
  const currentProfile = process.env.LINQ_PROFILE || configFile.profile;

  configFile.profiles[currentProfile] = {
    ...configFile.profiles[currentProfile],
    ...config,
  };

  await saveConfigFile(configFile);
}

export async function listProfiles(): Promise<string[]> {
  const configFile = await loadConfigFile();
  return Object.keys(configFile.profiles);
}

export async function getCurrentProfile(): Promise<string> {
  const configFile = await loadConfigFile();
  return process.env.LINQ_PROFILE || configFile.profile;
}

export async function setCurrentProfile(profileName: string): Promise<void> {
  const configFile = await loadConfigFile();

  if (!configFile.profiles[profileName]) {
    throw new Error(
      `Profile "${profileName}" not found. Available: ${Object.keys(configFile.profiles).join(', ')}`
    );
  }

  configFile.profile = profileName;
  await saveConfigFile(configFile);
}

export async function saveProfile(
  profileName: string,
  profile: Profile
): Promise<void> {
  const configFile = await loadConfigFile();

  configFile.profiles[profileName] = {
    ...configFile.profiles[profileName],
    ...profile,
  };

  await saveConfigFile(configFile);
}

export async function deleteProfile(profileName: string): Promise<void> {
  const configFile = await loadConfigFile();

  if (!configFile.profiles[profileName]) {
    throw new Error(`Profile "${profileName}" not found`);
  }

  if (profileName === 'default') {
    throw new Error('Cannot delete the default profile');
  }

  delete configFile.profiles[profileName];

  if (configFile.profile === profileName) {
    configFile.profile = 'default';
  }

  await saveConfigFile(configFile);
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

export function requireFromPhone(
  flagFrom: string | undefined,
  config: Config
): string {
  const fromPhone = flagFrom || config.fromPhone;
  if (!fromPhone) {
    throw new Error(
      "No sender phone found. Use --from or run 'linq config set fromPhone +1234567890'"
    );
  }
  return fromPhone;
}
