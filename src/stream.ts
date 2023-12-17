import {getEnv} from "./utils/env";
import {YoutubeBroadcast} from "./stream/youtubeBroadcast";
import {StreamIngestionProtocolType, StreamType} from "./types/stream";

let youtubeBroadcast: YoutubeBroadcast | null;

const STREAM_PRIVACY_TYPE_VALUES: Array<StreamType> = ["private", "unlisted"];
const STREAM_TYPE_VALUES: Array<StreamIngestionProtocolType> = ["rtmp", "hls"];

function getArgs(): {
  streamName: string;
  streamKey: string;
  cameraRtspUrl: string;
  streamPrivacyType: StreamType;
  streamType: StreamIngestionProtocolType;
  liveTime: number | null;
} {
  const streamPrivacyType = process.env.STREAM_PRIVACY_TYPE || "private";
  if (!(STREAM_PRIVACY_TYPE_VALUES as Array<string>).includes(streamPrivacyType)) {
    throw new Error(
      `Invalid value for STREAM_PRIVACY_TYPE ${streamPrivacyType}. Available values: ${STREAM_PRIVACY_TYPE_VALUES}`,
    );
  }

  const streamType = process.env.STREAM_TYPE || "rtmp";
  if (!(STREAM_TYPE_VALUES as Array<string>).includes(streamType)) {
    throw new Error(`Invalid value for STREAM_TYPE ${streamType}. Available values: ${STREAM_TYPE_VALUES}`);
  }

  const liveTime = process.env.LIVE_TIME ? +process.env.LIVE_TIME : null;
  if (Number.isNaN(liveTime)) {
    throw new Error(`Invalid value for LIVE_TIME. Value must be number`);
  }

  return {
    streamName: getEnv("STREAM_NAME"),
    streamKey: getEnv("STREAM_KEY"),
    cameraRtspUrl: getEnv("CAMERA_RTSP_URL"),
    streamPrivacyType: streamPrivacyType as StreamType,
    streamType: streamType as StreamIngestionProtocolType,
    liveTime,
  };
}

export async function main(): Promise<void> {
  const {streamName, streamKey, cameraRtspUrl, streamPrivacyType, streamType, liveTime} = getArgs();
  youtubeBroadcast = new YoutubeBroadcast(
    streamName,
    streamKey,
    cameraRtspUrl,
    streamPrivacyType,
    streamType,
    liveTime,
  );
  await youtubeBroadcast.start();
}

process.on("unhandledRejection", async (err) => {
  console.log("unhandledRejection", err);
  try {
    await youtubeBroadcast?.stop();
  } catch (e) {
    console.log("youtubeBroadcast.stop error", e);
  }
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("SIGINT catched");
  try {
    await youtubeBroadcast?.stop();
  } catch (e) {
    console.log("youtubeBroadcast.stop error", e);
  }
  process.exit();
});
