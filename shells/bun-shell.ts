import { Shell } from "./shell";

export class BunShell extends Shell {
  setRaw(on: boolean): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    } else {
      throw new Error("stdin is not a TTY");
    }
  }
  getShellSize(): { rows: number; columns: number } {
    return {
      rows: process.stdout.rows,
      columns: process.stdout.columns,
    };
  }
  protected writeToStandardOut(contents: string): void {
    process.stdout.write(contents);
  }
  protected readStandardIn(): Promise<Uint8Array> {
    this.setRaw(true);
    process.stdin.resume();

    return new Promise((resolve) => {
      return process.stdin.once("data", (data) => {
        this.setRaw(false);
        process.stdin.pause();

        resolve(data);
      });
    });
  }
  onWindowResize(onEvent: () => void): { stopListening: () => void } {
    try {
      process.on("SIGWINCH", onEvent);
      return { stopListening: () => {} };
    } catch (error) {
      // windows doesn't support SIGWINCH
      throw new Error("Unable to listen for SIGWINCH");
    }
  }
}
