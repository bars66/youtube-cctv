import {FfmpegBase} from "./ffmpegBase";

export class HlsFfmpeg extends FfmpegBase {
  protected getFfmpegArgs(cameraUrl: string, youtubeUrl: string): Array<string> {
    return [
      "-loglevel",
      "warning",
      "-nostats",
      "-hide_banner",
      "-rtsp_transport",
      "tcp",
      "-i",
      cameraUrl,
      "-c:v",
      "copy",
      "-f",
      "hls",
      "-method",
      "PUT",
      "-hls_time",
      "1",
      "-http_persistent",
      "1",
      "-ignore_io_errors",
      "1",
      youtubeUrl,
    ];
  }
}
