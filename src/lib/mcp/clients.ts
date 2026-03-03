import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export interface McpServerEntry {
  command: string;
  args: string[];
}

export interface AiClient {
  name: string;
  configPath: string;
  getServerEntry(config: Record<string, unknown>): McpServerEntry | undefined;
  setServerEntry(config: Record<string, unknown>, entry: McpServerEntry): void;
  removeServerEntry(config: Record<string, unknown>): boolean;
}

function mcpServersAccessor(): Pick<AiClient, 'getServerEntry' | 'setServerEntry' | 'removeServerEntry'> {
  return {
    getServerEntry(config) {
      const servers = (config.mcpServers ?? {}) as Record<string, McpServerEntry>;
      return servers.linq;
    },
    setServerEntry(config, entry) {
      if (!config.mcpServers) config.mcpServers = {};
      (config.mcpServers as Record<string, McpServerEntry>).linq = entry;
    },
    removeServerEntry(config) {
      const servers = config.mcpServers as Record<string, McpServerEntry> | undefined;
      if (servers?.linq) {
        delete servers.linq;
        return true;
      }
      return false;
    },
  };
}

export function configPath(
  paths: { darwin: string; win32: string; linux: string },
  platform: NodeJS.Platform = process.platform,
): string {
  if (platform === 'win32') return paths.win32;
  if (platform === 'darwin') return paths.darwin;
  return paths.linux;
}

function appData(home: string): string {
  return process.env.APPDATA ?? resolve(home, 'AppData/Roaming');
}

function xdgConfig(home: string): string {
  return process.env.XDG_CONFIG_HOME ?? resolve(home, '.config');
}

export function buildAiClients(
  platform: NodeJS.Platform = process.platform,
  home: string = homedir(),
): AiClient[] {
  const ad = appData(home);
  const xdg = xdgConfig(home);

  return [
    {
      name: 'Claude Desktop',
      configPath: configPath(
        {
          darwin: resolve(home, 'Library/Application Support/Claude/claude_desktop_config.json'),
          win32: resolve(ad, 'Claude/claude_desktop_config.json'),
          linux: resolve(xdg, 'Claude/claude_desktop_config.json'),
        },
        platform,
      ),
      ...mcpServersAccessor(),
    },
    {
      name: 'Claude Code',
      configPath: resolve(home, '.claude.json'),
      ...mcpServersAccessor(),
    },
  ];
}

export const AI_CLIENTS: AiClient[] = buildAiClients();

export function detectInstalledClients(): AiClient[] {
  return AI_CLIENTS.filter((client) => {
    const dir = dirname(client.configPath);
    return existsSync(client.configPath) || existsSync(dir);
  });
}

export function readConfig(client: AiClient): Record<string, unknown> {
  if (!existsSync(client.configPath)) return {};
  try {
    return JSON.parse(readFileSync(client.configPath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeConfig(client: AiClient, config: Record<string, unknown>): void {
  const dir = dirname(client.configPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(client.configPath, JSON.stringify(config, null, 2) + '\n');
}

export function resolveLinqCommand(platform: NodeJS.Platform = process.platform): McpServerEntry {
  const cmd = platform === 'win32' ? 'where linq' : 'which linq';
  try {
    const linqPath = execSync(cmd, { encoding: 'utf-8' }).trim();
    if (linqPath) {
      return { command: 'linq', args: ['mcp'] };
    }
  } catch {
    // linq not in PATH
  }

  const binRunJs = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../..',
    'bin/run.js',
  );
  return { command: 'node', args: [binRunJs, 'mcp'] };
}
