import {checkFfmpeg} from "./utils/checkFfmpeg";

export async function main(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("../package.json");

  console.log(`${pkg.name}@${pkg.version}`);

  try {
    await checkFfmpeg();
  } catch (e) {
    console.log("ffmpeg not found! Please install");
  }
}
