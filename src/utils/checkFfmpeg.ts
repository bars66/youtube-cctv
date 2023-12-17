import {spawn} from "child_process";

const VERSION_REGEXP = new RegExp(/ffmpeg version \d+\.\d+\.\d+/);

export async function checkFfmpeg(): Promise<void> {
  return new Promise((resolve, reject) => {
    const sp = spawn("ffmpeg");
    let data: string = "";

    sp.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    sp.stderr.on("data", (chunk) => {
      data += chunk.toString();
    });

    sp.once("error", () => {
      reject(new Error("Need ffmpeg for streaming"));
    });

    sp.once("close", () => {
      const versionStr = data.match(VERSION_REGEXP);

      if (versionStr) {
        console.log(`Found: "${versionStr[0]}"`);
      }

      resolve();
    });
  });
}
