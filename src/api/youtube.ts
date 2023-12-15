import {getAuthClientByToken} from "../utils/auth";
import {google, youtube_v3 as YoutubeTypes} from "googleapis";

const SHIFT = 60 * 1000;

type StreamInfo = {id: string; url: string};

export class YoutubeAuthorizedApi {
  oAuth2Client: ReturnType<typeof getAuthClientByToken>;
  constructor(accessToken: string, refreshToken: string) {
    this.oAuth2Client = getAuthClientByToken(refreshToken, accessToken);
  }

  private async createStream(translationKeyName: string): Promise<YoutubeTypes.Schema$LiveStream> {
    const res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveStreams.insert({
      part: ["snippet,contentDetails,status,cdn"],
      requestBody: {
        snippet: {
          title: translationKeyName,
        },
        cdn: {
          frameRate: "variable",
          ingestionType: "rtmp",
          resolution: "variable",
        },
      },
    });

    return res.data;
  }

  async getStreamInfoByName(translationKeyName: string): Promise<StreamInfo> {
    const res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveStreams.list({
      part: ["snippet,contentDetails,status,cdn"],
      maxResults: 100,
      mine: true,
    });

    let apikey = res.data.items?.find((item) => item?.snippet?.title === translationKeyName);

    if (!apikey) {
      apikey = await this.createStream(translationKeyName);
    }

    const streamId = apikey.id;
    const url = apikey.cdn?.ingestionInfo?.ingestionAddress;
    const streamApiKey = apikey.cdn?.ingestionInfo?.streamName;

    if (!streamId || !url || !streamApiKey) {
      throw new Error("no stream api key");
    }

    return {
      id: streamId,
      url: url + "/" + streamApiKey,
    };
  }

  async createBroadcast(streamName: string, privacyType: "private" | "unlisted"): Promise<string> {
    const res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveBroadcasts.insert({
      part: ["snippet,contentDetails,status"],
      requestBody: {
        snippet: {
          title: streamName,
          // небольшой сдвиг, что бы гарантированно успеть
          scheduledStartTime: new Date(Date.now() + SHIFT).toISOString(),
        },
        contentDetails: {
          enableAutoStart: true,
          enableDvr: true,
          recordFromStart: true,
          startWithSlate: true,
        },
        status: {
          selfDeclaredMadeForKids: false,
          privacyStatus: privacyType,
        },
      },
    });

    const translationId = res.data.id;
    if (res.statusText !== "OK" || !translationId) {
      console.log("[YOUTUBE API][createBroadcast] response", JSON.stringify(res, null, 2));

      throw new Error("translation not create");
    }

    return translationId;
  }

  async bindBroadcastToStream(broadcastId: string, streamInfo: StreamInfo) {
    const res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveBroadcasts.bind({
      part: ["snippet,contentDetails,status"],
      id: broadcastId,
      streamId: streamInfo.id,
    });

    if (res.statusText !== "OK") {
      console.log("[YOUTUBE API][bindBroadcastToStream] response", JSON.stringify(res, null, 2));

      throw new Error("bindStream error");
    }
  }

  getBroadcastLink(broadcastId: string) {
    return `https://www.youtube.com/watch?v=${broadcastId}`;
  }

  async stopBroadcast(broadcastId: string) {
    const res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveBroadcasts.transition({
      part: ["snippet,contentDetails,status"],
      id: broadcastId,
      broadcastStatus: "complete",
    });

    if (res.statusText !== "OK") {
      console.log("[YOUTUBE API][stopBroadcast] error", JSON.stringify(res, null, 2));
    }
    console.log(`[YOUTUBE API][stopBroadcast] ${broadcastId}`);
  }

  private async deleteBroadcast(broadcastId: string) {
    const res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveBroadcasts.delete({
      id: broadcastId,
    });

    if (res.statusText !== "OK") {
      console.log("[YOUTUBE API][deleteBroadcast] error", JSON.stringify(res, null, 2));
    }
    console.log(`[YOUTUBE API][deleteBroadcast] ${broadcastId}`);
  }

  async clearCurrentStream(streamInfo: StreamInfo) {
    let res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveBroadcasts.list({
      part: ["id,snippet,contentDetails,monetizationDetails,status"],
      maxResults: 100,
      broadcastStatus: "active",
    });

    // Активные трансляции останавливаем
    for (const {id: broadcastId, contentDetails} of res.data.items || []) {
      if (broadcastId && contentDetails?.boundStreamId === streamInfo.id) {
        console.log(
          `[YOUTUBE API][stopTranslationsWithCurrentStream] Find active translation with current stream: ${broadcastId}. The broadcast will be stopped.`,
        );
        await this.stopBroadcast(broadcastId);
      }
    }

    // Незапущенные удаляем
    res = await google.youtube({version: "v3", auth: this.oAuth2Client}).liveBroadcasts.list({
      part: ["id,snippet,contentDetails,monetizationDetails,status"],
      maxResults: 100,
      broadcastStatus: "upcoming",
    });

    for (const {id: broadcastId, contentDetails} of res.data.items || []) {
      if (broadcastId && contentDetails?.boundStreamId === streamInfo.id) {
        console.log(
          `[YOUTUBE API][stopTranslationsWithCurrentStream] Find upcoming translation with current stream: ${broadcastId}. The broadcast will be deleted.`,
        );
        await this.deleteBroadcast(broadcastId);
      }
    }
  }
}
