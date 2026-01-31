import { Help } from '@oclif/core';
import { BANNER } from './lib/banner.js';

export default class LinqHelp extends Help {
  async showRootHelp(): Promise<void> {
    console.log(BANNER);
    await super.showRootHelp();
  }
}
