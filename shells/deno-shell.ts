import { Shell } from "./shell.ts";

const sleep = (amount: number) =>
  new Promise((resolve) => setTimeout(() => resolve(undefined), amount));

export class DenoShell extends Shell {
  debugMode = false;

  protected getShellSize() {
    return Deno.consoleSize();
  }

  protected writeToStandardOut(contents: string) {
    if (this.debugMode) return;
    Deno.stdout.writeSync(new TextEncoder().encode(contents));
  }

  setRaw(on: boolean) {
    if (on !== this.isRaw) {
      Deno.stdin.setRaw(on);
    }
    this.isRaw = on;
  }

  protected async readStandardIn() {
    const { stdin } = Deno;

    const buf = new Uint8Array(100);
    const bytesRead = (await stdin.read(buf)) || 0;
    const filledBuf = buf.slice(0, bytesRead);

    return filledBuf;
  }

  _previous_window_width?: number;
  _previous_window_height?: number;
  _should_poll_window_size = false;
  private _check_window_size(onChange: () => void) {
    const { columns: width, rows: height } = this.getShellSize();

    if (
      this._previous_window_height !== height ||
      this._previous_window_width !== width
    ) {
      onChange();
    }

    this._previous_window_height = height;
    this._previous_window_width = width;
  }

  private async _poll_window_size(onChange: () => void) {
    this._should_poll_window_size = true;
    this._previous_window_height = this.height;
    this._previous_window_width = this.width;

    while (this._should_poll_window_size) {
      this._check_window_size(onChange);
      await sleep(1000);
    }
  }

  onWindowResize(onEvent: () => void) {
    try {
      Deno.addSignalListener("SIGWINCH", onEvent);
      return {
        stopListening: () => Deno.removeSignalListener("SIGWINCH", onEvent),
      };
    } catch {
      // e.g. Windows doesn't support SIGWINCH
      this._poll_window_size(onEvent);
      return {
        stopListening: () => (this._should_poll_window_size = false),
      };
    }
  }
}
