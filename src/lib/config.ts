import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const CONFIG_DIR = '.linq';
const CONFIG_FILE = 'config.json';

export const SANDBOX_PROFILE = 'sandbox';

export interface Profile {
  token?: string;
  partnerId?: string;
  fromPhone?: string;
  // Sandbox-only fields (set by `linq signup`)
  expiresAt?: string;
  githubLogin?: string;
}

export interface ConfigFile {
  version?: number;
  profile: string;
  profiles: Record<string, Profile>;
  sandbox?: Record<string, unknown>; // legacy, cleaned up by migration
  telemetry?: boolean;
}

function getHomeDir(): string {
  return process.env.HOME || homedir();
}

function getConfigPath(): string {
  return join(getHomeDir(), CONFIG_DIR, CONFIG_FILE);
}

function createEmptyConfigFile(): ConfigFile {
  return {
    version: 2,
    profile: 'default',
    profiles: {
      default: {},
    },
  };
}

async function migrateConfig(configFile: ConfigFile): Promise<ConfigFile> {
  let dirty = false;

  // Legacy: root-level sandbox object → merge into sandbox profile
  if (configFile.sandbox) {
    const meta = configFile.sandbox;
    if (!configFile.profiles[SANDBOX_PROFILE]) {
      configFile.profiles[SANDBOX_PROFILE] = {};
    }
    const sb = configFile.profiles[SANDBOX_PROFILE];
    sb.fromPhone ??= meta.phone as string;
    sb.expiresAt ??= meta.expiresAt as string;
    sb.githubLogin ??= meta.githubLogin as string;
    delete configFile.sandbox;
    dirty = true;
  }

  // Legacy: nested sandbox object inside a profile → extract to sandbox profile
  for (const [name, profile] of Object.entries(configFile.profiles)) {
    const raw = profile as Record<string, unknown>;
    if (raw.sandbox && typeof raw.sandbox === 'object' && 'phone' in raw.sandbox) {
      const nested = raw.sandbox as Record<string, unknown>;

      // Create sandbox profile with creds from the original profile
      configFile.profiles[SANDBOX_PROFILE] = {
        token: profile.token,
        partnerId: profile.partnerId,
        fromPhone: (nested.phone as string) || profile.fromPhone,
        expiresAt: nested.expiresAt as string,
        githubLogin: nested.githubLogin as string,
      };

      // Clean the original profile if it's not the sandbox profile
      if (name !== SANDBOX_PROFILE) {
        delete raw.sandbox;
        if (profile.fromPhone === nested.phone) {
          delete profile.token;
          delete profile.fromPhone;
          delete profile.partnerId;
        }
      }

      dirty = true;
      break;
    }
  }

  // Legacy: remove stale fields from all profiles
  for (const profile of Object.values(configFile.profiles)) {
    const raw = profile as Record<string, unknown>;
    for (const key of ['phone', 'userPhone', 'sandbox']) {
      if (key in raw) {
        delete raw[key];
        dirty = true;
      }
    }
  }

  if (!configFile.version || configFile.version < 2) {
    configFile.version = 2;
    dirty = true;
  }

  if (dirty) {
    await saveConfigFile(configFile);
  }

  return configFile;
}

export async function loadConfigFile(): Promise<ConfigFile> {
  try {
    const path = getConfigPath();
    const data = await readFile(path, 'utf-8');
    const parsed = JSON.parse(data) as ConfigFile;

    if (!parsed.profiles) {
      return createEmptyConfigFile();
    }

    return migrateConfig(parsed);
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

export async function loadConfig(profileName?: string): Promise<Profile> {
  const configFile = await loadConfigFile();

  const envProfile = process.env.LINQ_PROFILE;
  const targetProfile = profileName || envProfile || configFile.profile;

  if (!configFile.profiles[targetProfile]) {
    throw new Error(
      `Profile "${targetProfile}" not found. Available: ${Object.keys(configFile.profiles).join(', ')}`
    );
  }

  const config = { ...configFile.profiles[targetProfile] };

  // Environment variables override profile settings
  if (process.env.LINQ_TOKEN) config.token = process.env.LINQ_TOKEN;
  if (process.env.LINQ_FROM_PHONE) config.fromPhone = process.env.LINQ_FROM_PHONE;

  return config;
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
  if (profileName === SANDBOX_PROFILE) {
    throw new Error(`The "${SANDBOX_PROFILE}" profile is reserved for \`linq signup\``);
  }

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

export async function getSandboxProfile(): Promise<Profile | undefined> {
  const configFile = await loadConfigFile();
  const sandbox = configFile.profiles[SANDBOX_PROFILE];
  if (sandbox?.fromPhone && sandbox?.expiresAt) return sandbox;
  return undefined;
}

export function isSandboxExpired(profile: Profile): boolean {
  return !profile.expiresAt || new Date(profile.expiresAt) <= new Date();
}

export async function saveSandboxProfile(profile: Profile): Promise<void> {
  const configFile = await loadConfigFile();

  configFile.profiles[SANDBOX_PROFILE] = {
    ...configFile.profiles[SANDBOX_PROFILE],
    ...profile,
  };

  await saveConfigFile(configFile);
}

export function requireToken(
  flagToken: string | undefined,
  config: Profile
): string {
  const token = flagToken || config.token;
  if (!token) {
    throw new Error("No token found. Run 'linq login' or set LINQ_TOKEN");
  }
  return token;
}

export function requireFromPhone(
  flagFrom: string | undefined,
  config: Profile
): string {
  const fromPhone = flagFrom || config.fromPhone;
  if (!fromPhone) {
    throw new Error(
      "No sender phone found. Use --from or run 'linq profile set fromPhone +1234567890'"
    );
  }
  return fromPhone;
}
