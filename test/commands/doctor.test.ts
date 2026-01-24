import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Config } from '@oclif/core';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import Doctor from '../../src/commands/doctor.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('doctor', () => {
  let tempDir: string;
  let originalHome: string | undefined;
  let logs: string[];

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linq-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tempDir;
    mockFetch.mockReset();
    logs = [];
  });

  afterEach(async () => {
    process.env.HOME = originalHome;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function captureOutput(cmd: Doctor): void {
    cmd.log = (...args: string[]) => {
      logs.push(args.join(' '));
    };
  }

  it('reports all checks passing with full config', async () => {
    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: {
          default: {
            token: 'test-token-123',
            fromPhone: '+12025551234',
          },
        },
      })
    );

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, [{ phone_number: '+12025551234' }])
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Doctor([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('\u2713 Config file exists');
    expect(output).toContain('\u2713 API token is configured');
    expect(output).toContain('\u2713 Default phone number is set');
    expect(output).toContain('\u2713 API connection successful');
    expect(output).toContain('4 checks passed, 0 issues found');
  });

  it('reports missing config when no config file exists', async () => {
    const config = await Config.load({ root: process.cwd() });
    const cmd = new Doctor([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('\u2717 API token is not configured');
    expect(output).toContain('\u2717 Default phone number is not set');
    expect(output).not.toContain('0 issues found');
  });

  it('reports API failure with invalid token', async () => {
    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: {
          default: {
            token: 'bad-token',
          },
        },
      })
    );

    mockFetch.mockResolvedValueOnce(
      createMockResponse(401, { error: 'Unauthorized' })
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Doctor([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).toContain('\u2713 API token is configured');
    expect(output).toContain('\u2717 API request failed');
  });

  it('masks token values in output', async () => {
    const configDir = path.join(tempDir, '.linq');
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        profile: 'default',
        profiles: {
          default: {
            token: 'my-secret-token-value',
          },
        },
      })
    );

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, [{ phone_number: '+12025551234' }])
    );

    const config = await Config.load({ root: process.cwd() });
    const cmd = new Doctor([], config);
    captureOutput(cmd);
    await cmd.run();

    const output = logs.join('\n');
    expect(output).not.toContain('my-secret-token-value');
    expect(output).toContain('my-s****alue');
  });
});
