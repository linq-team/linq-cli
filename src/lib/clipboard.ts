import { spawn } from 'node:child_process';

// Copy `text` to the OS clipboard. Returns true on success, false on
// any failure (binary missing, headless box, permission denied, etc.).
// Never throws — caller can branch on the boolean to adjust messaging.
export async function copyToClipboard(text: string): Promise<boolean> {
  const platform = process.platform;
  let cmd: string;
  let args: string[] = [];

  if (platform === 'darwin') {
    cmd = 'pbcopy';
  } else if (platform === 'win32') {
    cmd = 'clip';
  } else {
    // Linux/BSD — try xclip first (most common). Wayland users on
    // wl-copy will still get false here and fall back to the
    // copy-it-yourself message; we keep this dep-free on purpose.
    cmd = 'xclip';
    args = ['-selection', 'clipboard'];
  }

  return new Promise((resolve) => {
    try {
      const proc = spawn(cmd, args, { stdio: ['pipe', 'ignore', 'ignore'] });
      proc.on('error', () => resolve(false));
      proc.on('exit', (code) => resolve(code === 0));
      proc.stdin.write(text);
      proc.stdin.end();
    } catch {
      resolve(false);
    }
  });
}
