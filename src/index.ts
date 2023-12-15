import { getEnv } from "./utils/env";
import { YoutubeBroadcast } from "./stream/youtubeBroadcast";

const LIVE_TIME = prompt();
const youtubeBroadcast = new YoutubeBroadcast(
  getEnv("STREAM_NAME"),
  getEnv("STREAM_KEY"),
  getEnv("CAMERA_RTSP_URL"),
  "private",
  null,
);
youtubeBroadcast.start().catch((e) => console.log("Start broadcast error", e));

process.on("unhandledRejection", async (err) => {
  console.log("unhandledRejection", err);
  try {
    await youtubeBroadcast.stop();
  } catch (e) {}
  process.exit();
});

process.on("SIGINT", async () => {
  console.log("SIGINT catched");
  try {
    await youtubeBroadcast.stop();
  } catch (e) {}
  process.exit();
});
