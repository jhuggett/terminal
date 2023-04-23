import { Shell } from "./shell.ts";

export class DenoShell extends Shell {
  debugMode = false;

  private cached_width?: number 
  get width() {
    if (this.cached_width === undefined) {
      this.cached_width = Deno.consoleSize().columns;
    } 
    return this.cached_width
  }

  private cached_height?: number
  get height() {
    return Deno.consoleSize().rows || 0
    // if (this.cached_height === undefined) {
    //   this.cached_height = Deno.consoleSize().rows;
    // } 
    // return this.cached_height;
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
}
