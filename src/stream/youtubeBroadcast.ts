import { Ffmpeg } from "./ffmpeg";
import { YoutubeAuthorizedApi } from "../api/youtube";
import { getEnv } from "../utils/env";

export class YoutubeBroadcast {
  ffmpeg: Ffmpeg;
  youtubeApi: YoutubeAuthorizedApi;
  timeoutId: NodeJS.Timeout | null = null;
  isRunned: boolean = false;
  broadcastId: string | null = null;

  constructor(
    private streamName: string,
    private translationKeyName: string,
    private cameraUrl: string,
    private type: "private" | "unlisted",
    private liveTime: number | null,
  ) {
    this.ffmpeg = new Ffmpeg(this.cameraUrl);
    this.youtubeApi = new YoutubeAuthorizedApi(
      getEnv("YOUTUBE_ACCESS_TOKEN"),
      getEnv("YOUTUBE_REFRESH_TOKEN"),
    );
  }

  private setWatcher(): void {
    if (!this.liveTime) {
      return;
    }

    console.log(`The broadcast will be recreated in ${this.liveTime}`);
    this.timeoutId = setTimeout(async () => {
      console.log(`The broadcast will be recreated`);
      try {
        await this.stop();
        await this.start();
      } catch (e) {
        console.log("Restart broadcast error", e);
      }
    }, this.liveTime);
  }

  async stop(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.broadcastId) {
      await this.youtubeApi.stopBroadcast(this.broadcastId);
    }
    await this.ffmpeg.stop();
  }

  async start(): Promise<void> {
    this.isRunned = true;
    console.log("Start broadcast");
    const streamInfo = await this.youtubeApi.getStreamInfoByName(
      this.translationKeyName,
    );
    await this.youtubeApi.clearCurrentStream(streamInfo);

    const broadcastId = await this.youtubeApi.createBroadcast(
      this.streamName,
      this.type,
    );
    await this.youtubeApi.bindBroadcastToStream(broadcastId, streamInfo);
    this.ffmpeg.setOutputUrl(streamInfo.url);
    console.log(
      `Broadcast url: ${this.youtubeApi.getBroadcastLink(broadcastId)}`,
    );
    this.broadcastId = broadcastId;
    this.ffmpeg.run();

    this.setWatcher();
  }
}
