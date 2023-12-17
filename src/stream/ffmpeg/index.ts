import {StreamIngestionProtocolType} from "../../types/stream";
import {FfmpegStreamer} from "./ffmpegBase";
import {HlsFfmpeg} from "./hls";
import {RtmpFfmpeg} from "./rtmp";

const STREAMER_BY_TYPE = {
  hls: HlsFfmpeg,
  rtmp: RtmpFfmpeg,
};

export function getFfmpegStreamer(type: StreamIngestionProtocolType, cameraUrl: string): FfmpegStreamer {
  const streamerCl = STREAMER_BY_TYPE[type];
  return new streamerCl(cameraUrl);
}
