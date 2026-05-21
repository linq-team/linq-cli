import chalk from 'chalk';
import { render } from 'ink';
import React from 'react';
import LinqCli, { STATIC_LOGO_LINES } from './banner-motion.js';

const white = chalk.hex('#ffffff');

const ART = STATIC_LOGO_LINES.map(line => '  ' + line).join('\n');

const TEXT_LOGO = '\n' + white(ART) + '\n';

export const LOGO = TEXT_LOGO;

const ANIMATION_MS = 2100;

export async function renderBanner(): Promise<void> {
  if (!process.stdout.isTTY || process.env.NO_COLOR || process.env.CI) {
    console.log(TEXT_LOGO);
    return;
  }

  await new Promise<void>((resolve) => {
    const app = render(
      React.createElement(LinqCli, {
        autoPlay: true,
        loop: false,
        hasDarkBackground: true,
      }),
    );
    setTimeout(() => {
      app.unmount();
      resolve();
    }, ANIMATION_MS);
  });

}
