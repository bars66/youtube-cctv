import {getEnv} from "./utils/env";
import {YoutubeBroadcast} from "./stream/youtubeBroadcast";

const LIVE_TIME = process.env.LIVE_TIME ? +process.env.LIVE_TIME : null;
const youtubeBroadcast = new YoutubeBroadcast(
  getEnv("STREAM_NAME"),
  getEnv("STREAM_KEY"),
  getEnv("CAMERA_RTSP_URL"),
  "private",
  LIVE_TIME,
);
youtubeBroadcast.start().catch((e) => console.log("Start broadcast error", e));
const a = '';
process.on("unhandledRejection", async (err) => {
  console.log("unhandledRejection", err);
  try {
    await youtubeBroadcast.stop();
  } catch (e) {
    console.log("youtubeBroadcast.stop error", e);
  }
  process.exit();
});

process.on("SIGINT", async () => {
  console.log("SIGINT catched");
  try {
    await youtubeBroadcast.stop();
  } catch (e) {
    console.log("youtubeBroadcast.stop error", e);
  }
  process.exit();
});
