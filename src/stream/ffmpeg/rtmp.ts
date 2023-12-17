import {FfmpegBase} from "./ffmpegBase";

export class RtmpFfmpeg extends FfmpegBase {
  protected getFfmpegArgs(cameraUrl: string, youtubeUrl: string): Array<string> {
    return [
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
      cameraUrl,
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
      youtubeUrl,
    ];
  }
}
