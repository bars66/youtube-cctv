import {google} from "googleapis";
import {getAuthClientByToken} from "../authUtils";

export async function getStreamInfoByName(translationKeyName: string): Promise<{ id: string, url: string }> {
    const res = await google.youtube({version: 'v3', auth: getAuthClientByToken()}).liveStreams.list({
        part: [
            "snippet,contentDetails,status,cdn"
        ],
        mine: true,
    });
    let apikey = res.data.items?.find(item => item?.snippet?.title === translationKeyName)
    if (!apikey) {
        const res = await google.youtube({version: 'v3', auth: getAuthClientByToken()}).liveStreams.insert({
            part: [
                "snippet,contentDetails,status,cdn"
            ],
            requestBody: {
                snippet: {
                    title: translationKeyName,
                },
                cdn: {
                    frameRate: 'variable',
                    ingestionType: 'rtmp',
                    resolution: 'variable',
                }
            }
        });

        apikey = res.data;
    }
    const streamId = apikey.id;
    const url = apikey.cdn?.ingestionInfo?.ingestionAddress;
    const streamApiKey = apikey.cdn?.ingestionInfo?.streamName;

    if (!streamId || !url || !streamApiKey) {
        throw new Error('no stream api key');
    }

    return {
        id: streamId,
        url: url + '/' + streamApiKey,
    }
}