import { Help } from '@oclif/core';
import { LOGO } from './lib/banner.js';

export default class LinqHelp extends Help {
  async showRootHelp(): Promise<void> {
    console.log(LOGO);
    await super.showRootHelp();
  }
}
