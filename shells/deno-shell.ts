import { Shell } from "./shell.ts";

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

  onWindowResize(onEvent: () => void) {
    Deno.addSignalListener("SIGWINCH", onEvent);
    return {
      stopListening: () => Deno.removeSignalListener("SIGWINCH", onEvent),
    };
  }
}
