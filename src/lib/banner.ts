import chalk from 'chalk';
import { STATIC_LOGO_LINES, FRAMES } from './banner-frames.js';

const white = chalk.hex('#ffffff');
const ART = STATIC_LOGO_LINES.map((line) => '  ' + line).join('\n');
const TEXT_LOGO = '\n' + white(ART) + '\n';

export const LOGO = TEXT_LOGO;

// Total animation duration + a small buffer to ensure the last frame paints
// before we unmount.
const ANIMATION_MS =
  FRAMES.reduce((sum, frame) => sum + frame.duration, 0) + 200;

export async function renderBanner(): Promise<void> {
  if (!process.stdout.isTTY || process.env.NO_COLOR || process.env.CI) {
    console.log(TEXT_LOGO);
    return;
  }

  // Defer the ink + react import to runtime — otherwise every `linq <cmd>`
  // pays the cost (and triggers Node's `ExperimentalWarning: Importing JSON
  // modules`) even when no banner plays.
  const [{ render }, React, { default: LinqCli }] = await Promise.all([
    import('ink'),
    import('react'),
    import('./banner-motion.js'),
  ]);

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
