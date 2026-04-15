import { Args, Flags } from '@oclif/core';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseCommand } from '../lib/base-command.js';
import { loadConfig, requireToken, saveProfile, saveSandboxProfile, getCurrentProfile, SANDBOX_PROFILE } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';

export default class PhoneNumbers extends BaseCommand {
  static override description = 'List your phone numbers or set a default';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> set',
  ];

  static override args = {
    action: Args.string({
      description: 'Action: "set" to pick a default phone number',
      required: false,
    }),
  };

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    profile: Flags.string({
      char: 'p',
      description: 'Config profile to use',
      hidden: true,
    }),
    token: Flags.string({
      char: 't',
      description: 'API token (overrides stored token)',
      hidden: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PhoneNumbers);

    const config = await loadConfig(flags.profile);
    const token = requireToken(flags.token, config);
    const client = createApiClient(token);

    let phones: { phone_number: string }[];
    try {
      const data = await client.phoneNumbers.list();
      phones = (data as any).phone_numbers || [];
    } catch (e) {
      this.error(`Failed to list phone numbers: ${e instanceof Error ? e.message : String(e)}`);
    }

    if (phones.length === 0) {
      this.log('\n  No phone numbers found.\n');
      return;
    }

    if (args.action === 'set') {
      await this.setDefault(phones, config.fromPhone, flags.profile);
      return;
    }

    if (flags.json) {
      this.log(JSON.stringify({ phone_numbers: phones }, null, 2));
      return;
    }

    this.log(`\n  ${chalk.bold('Your phone numbers')}\n`);
    for (const p of phones) {
      const isDefault = p.phone_number === config.fromPhone;
      this.log(`  ${this.formatPhone(p.phone_number)}${isDefault ? chalk.green(' ← default') : ''}`);
    }
    if (!config.fromPhone && phones.length > 1) {
      this.log(`\n  ${chalk.dim('Tip: run')} ${chalk.cyan('linq phonenumbers set')} ${chalk.dim('to pick a default.')}`);
    }
    this.log('');
  }

  private async setDefault(phones: { phone_number: string }[], currentDefault: string | undefined, profileFlag: string | undefined): Promise<void> {
    if (phones.length === 1) {
      const phone = phones[0].phone_number;
      await this.saveFromPhone(phone, profileFlag);
      this.log(chalk.green(`\n  ✓ Default set to ${this.formatPhone(phone)}\n`));
      return;
    }

    try {
      const chosen = await select({
        message: 'Select your default phone number:',
        choices: phones.map(p => ({
          name: p.phone_number === currentDefault
            ? `${this.formatPhone(p.phone_number)} (current default)`
            : this.formatPhone(p.phone_number),
          value: p.phone_number,
        })),
      });

      await this.saveFromPhone(chosen, profileFlag);
      this.log(chalk.green(`\n  ✓ Default set to ${this.formatPhone(chosen)}\n`));
    } catch (error) {
      if (error instanceof Error && error.name === 'ExitPromptError') {
        return;
      }
      throw error;
    }
  }

  private async saveFromPhone(phone: string, profileFlag: string | undefined): Promise<void> {
    const profileName = profileFlag || await getCurrentProfile() || 'default';
    const existing = await loadConfig(profileFlag);
    const merged = { ...existing, fromPhone: phone };
    if (profileName === SANDBOX_PROFILE) {
      await saveSandboxProfile(merged);
    } else {
      await saveProfile(profileName, merged);
    }
  }

  private formatPhone(phone: string): string {
    const match = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (match) return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    return phone;
  }
}
