import { spawn, ChildProcessByStdio } from "child_process";
import type { Writable, Readable } from "stream";
import { delay } from "../utils/promises";

export class Ffmpeg {
  isRunned: boolean = false;
  ffmpeg: ChildProcessByStdio<Writable, Readable, Readable> | null = null;
  youtubeUrl: string | null = null;

  constructor(private cameraUrl: string) {}

  private log(str: string, anything?: unknown) {
    const logStr = `[FFMPEG]${
      this.ffmpeg ? `[pid=${this.ffmpeg.pid}]` : ""
    }: ${str}`;
    if (anything) {
      console.log(logStr, anything);
    }
    console.log(logStr);
  }

  public setOutputUrl(url: string) {
    const oldUrl = this.youtubeUrl;
    this.youtubeUrl = url;

    if (oldUrl !== url && this.isRunned) {
      this.log("Change stream url, restart broadcast");
      this.restart().catch((e) => this.log("Ffmpeg restart error", e));
    }
  }

  private stderrHandler(data: string) {
    this.log(`stderr: ${data}`);
  }

  private stdoutHandler(data: string) {
    this.log(`stdout: ${data}`);
  }

  private closeHandle(code: number) {
    this.log(`exited with code ${code}`);
    this.ffmpeg = null;

    if (this.isRunned) {
      this.log("Restore ffmpeg after exit");
      this.restart().catch((e) => this.log("Ffmpeg restart error", e));
    }
  }

  public run() {
    if (!this.youtubeUrl) {
      throw new Error("Need youtube stream url for run ffmpeg");
    }

    this.isRunned = true;
    if (this.ffmpeg) {
      throw new Error("Ffmpeg is already running");
    }

    this.ffmpeg = spawn("ffmpeg", [
      "-nostats",
      "-hide_banner",
      "-f",
      "lavfi",
      "-i",
      "anullsrc",
      "-rtsp_transport",
      "tcp",
      "-r",
      "1",
      "-re",
      "-analyzeduration",
      "0",
      "-probesize",
      "1024",
      "-i",
      this.cameraUrl,
      "-tune",
      "zerolatency",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-strict",
      "experimental",
      "-f",
      "flv",
      "-flvflags",
      "no_duration_filesize",
      this.youtubeUrl,
    ]);
    this.log(`Start ffmpeg`);

    this.ffmpeg.stdout.on("data", this.stdoutHandler.bind(this));

    this.ffmpeg.stderr.on("data", this.stderrHandler.bind(this));

    this.ffmpeg.on("close", this.closeHandle.bind(this));
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.isRunned = false;

      if (!this.ffmpeg) {
        return resolve();
      }

      this.ffmpeg.once("close", () => {
        this.ffmpeg = null;
        resolve();
      });

      this.ffmpeg.kill("SIGINT");
    });
  }

  public async restart() {
    this.log("Ffmpeg force restart");

    await this.stop();
    await delay(1000);
    this.run();
  }
}
