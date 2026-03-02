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

function rootLevelAccessor(): Pick<AiClient, 'getServerEntry' | 'setServerEntry' | 'removeServerEntry'> {
  return {
    getServerEntry(config) {
      const servers = (config.servers ?? {}) as Record<string, McpServerEntry>;
      return servers.linq;
    },
    setServerEntry(config, entry) {
      if (!config.servers) config.servers = {};
      (config.servers as Record<string, McpServerEntry>).linq = entry;
    },
    removeServerEntry(config) {
      const servers = config.servers as Record<string, McpServerEntry> | undefined;
      if (servers?.linq) {
        delete servers.linq;
        return true;
      }
      return false;
    },
  };
}

const home = homedir();

export const AI_CLIENTS: AiClient[] = [
  {
    name: 'Claude Desktop',
    configPath: resolve(home, 'Library/Application Support/Claude/claude_desktop_config.json'),
    ...mcpServersAccessor(),
  },
  {
    name: 'Claude Code',
    configPath: resolve(home, '.claude.json'),
    ...mcpServersAccessor(),
  },
  {
    name: 'Cursor',
    configPath: resolve(home, '.cursor/mcp.json'),
    ...rootLevelAccessor(),
  },
  {
    name: 'VS Code',
    configPath: resolve(home, '.vscode/mcp.json'),
    ...rootLevelAccessor(),
  },
];

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

export function resolveLinqCommand(): McpServerEntry {
  try {
    const linqPath = execSync('which linq', { encoding: 'utf-8' }).trim();
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
