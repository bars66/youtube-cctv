#!/usr/bin/env node
import "dotenv/config";

const FN: {
  [key: string]: {
    fn: () => () => Promise<void>;
    desc: string;
    requiredEnvs: Array<string>;
  };
} = {
  auth: {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fn: () => require("./auth").main,
    desc: "Create YouTube account login keys",
    requiredEnvs: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URL"],
  },
  stream: {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fn: () => require("./stream").main,
    desc: "Start a youtube broadcast",
    requiredEnvs: [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_REDIRECT_URL",
      "YOUTUBE_ACCESS_TOKEN",
      "YOUTUBE_REFRESH_TOKEN",
    ],
  },
  version: {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fn: () => require("./version").main,
    desc: "Print version",
    requiredEnvs: [],
  },
};

function run(): void {
  const cmd = process.argv[2];
  const fn = FN[cmd];
  if (!fn) {
    console.log(
      `Unknown cmd: ${cmd}\nAvailable:\n${Object.keys(FN)
        .map((f) => `\t${f}: ${FN[f].desc}`)
        .join("\n")}`,
    );
    process.exit(-1);
  }

  for (const env of fn.requiredEnvs) {
    if (!process.env[env]) {
      console.log(
        `No env: ${env}. Read the readme https://github.com/bars66/youtube-cctv/blob/master/README.md before using to create required envs.`,
      );
      process.exit(-1);
    }
  }

  fn.fn()().catch((e) => {
    console.error("Global error", e);
  });
}

run();
