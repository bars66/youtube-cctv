#!/usr/bin/env node
import {main as auth} from "./auth";
import {main as stream} from "./stream";

const FN: {
  [key: string]: {
    fn: () => Promise<void>;
    desc: string;
  };
} = {
  auth: {
    fn: auth,
    desc: "Create YouTube account login keys",
  },
  stream: {
    fn: stream,
    desc: "Start a youtube broadcast",
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

  fn.fn().catch((e) => {
    console.error("Global error", e);
  });
}

run();
