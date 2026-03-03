import { describe, it, expect, vi } from 'vitest';
import { configPath, buildAiClients } from '../../../src/lib/mcp/clients.js';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

describe('configPath', () => {
  it('returns darwin path on macOS', () => {
    const result = configPath(
      { darwin: '/mac/path', win32: '/win/path', linux: '/linux/path' },
      'darwin',
    );
    expect(result).toBe('/mac/path');
  });

  it('returns win32 path on Windows', () => {
    const result = configPath(
      { darwin: '/mac/path', win32: '/win/path', linux: '/linux/path' },
      'win32',
    );
    expect(result).toBe('/win/path');
  });

  it('returns linux path on Linux', () => {
    const result = configPath(
      { darwin: '/mac/path', win32: '/win/path', linux: '/linux/path' },
      'linux',
    );
    expect(result).toBe('/linux/path');
  });

  it('returns linux path for unknown platforms', () => {
    const result = configPath(
      { darwin: '/mac/path', win32: '/win/path', linux: '/linux/path' },
      'freebsd' as NodeJS.Platform,
    );
    expect(result).toBe('/linux/path');
  });
});

describe('buildAiClients', () => {
  it('returns macOS paths on darwin', () => {
    const clients = buildAiClients('darwin', '/Users/test');
    const names = clients.map((c) => c.name);
    expect(names).toEqual(['Claude Desktop', 'Claude Code']);

    const desktop = clients.find((c) => c.name === 'Claude Desktop')!;
    expect(desktop.configPath).toBe(
      '/Users/test/Library/Application Support/Claude/claude_desktop_config.json',
    );
  });

  it('returns Windows paths on win32', () => {
    const clients = buildAiClients('win32', 'C:\\Users\\test');

    const desktop = clients.find((c) => c.name === 'Claude Desktop')!;
    expect(desktop.configPath).toContain('AppData');
    expect(desktop.configPath).toContain('Claude');
    expect(desktop.configPath).toContain('claude_desktop_config.json');
  });

  it('returns Linux paths on linux', () => {
    const clients = buildAiClients('linux', '/home/test');

    const desktop = clients.find((c) => c.name === 'Claude Desktop')!;
    expect(desktop.configPath).toBe('/home/test/.config/Claude/claude_desktop_config.json');
  });

  it('uses same path for Claude Code on all platforms', () => {
    for (const platform of ['darwin', 'win32', 'linux'] as const) {
      const clients = buildAiClients(platform, '/home/test');

      const code = clients.find((c) => c.name === 'Claude Code')!;
      expect(code.configPath).toBe('/home/test/.claude.json');
    }
  });
});

describe('resolveLinqCommand', () => {
  it('uses "where linq" on win32', async () => {
    const { execSync } = await import('node:child_process');
    const mock = vi.mocked(execSync);
    mock.mockReturnValueOnce('C:\\Program Files\\linq\\linq.exe\n');

    const { resolveLinqCommand } = await import('../../../src/lib/mcp/clients.js');
    const entry = resolveLinqCommand('win32');
    expect(mock).toHaveBeenCalledWith('where linq', { encoding: 'utf-8' });
    expect(entry).toEqual({ command: 'linq', args: ['mcp'] });
  });

  it('uses "which linq" on darwin', async () => {
    const { execSync } = await import('node:child_process');
    const mock = vi.mocked(execSync);
    mock.mockReturnValueOnce('/usr/local/bin/linq\n');

    const { resolveLinqCommand } = await import('../../../src/lib/mcp/clients.js');
    const entry = resolveLinqCommand('darwin');
    expect(mock).toHaveBeenCalledWith('which linq', { encoding: 'utf-8' });
    expect(entry).toEqual({ command: 'linq', args: ['mcp'] });
  });

  it('falls back to node bin/run.js when command not found', async () => {
    const { execSync } = await import('node:child_process');
    const mock = vi.mocked(execSync);
    mock.mockImplementationOnce(() => {
      throw new Error('not found');
    });

    const { resolveLinqCommand } = await import('../../../src/lib/mcp/clients.js');
    const entry = resolveLinqCommand('linux');
    expect(entry.command).toBe('node');
    expect(entry.args[0]).toContain('bin/run.js');
    expect(entry.args[1]).toBe('mcp');
  });
});
