import {google} from 'googleapis';
import {getAuthClientByToken} from "./authUtils";
import {getStreamInfoByName} from "./stream/getStreamInfoByName";
import {runffmpeg} from "./stream/runffmpeg";
import {getEnv} from "./util";

let TRANSLATION_ID: string | null = null;

const HOUR = 3600 * 1000;
async function main(streamName: string, translationKeyName: string, cameraUrl: string, type: 'private' | 'unlisted') {
    const oAuth2Client = getAuthClientByToken();
    const streamInfo = await getStreamInfoByName(translationKeyName);

    const res = await google.youtube({version: 'v3', auth: oAuth2Client}).liveBroadcasts.insert(
        {
            "part": [
                "snippet,contentDetails,status"
            ],
            requestBody: {
                snippet: {
                    "title": streamName,
                    "scheduledStartTime": (new Date(Date.now() + HOUR)).toISOString(),
                },
                "contentDetails": {
                    "enableAutoStart": true,
                    "enableDvr": true,
                    "recordFromStart": true,
                    "startWithSlate": true,
                    boundStreamId: streamInfo.id,
                },
                "status": {
                    selfDeclaredMadeForKids: false,
                    "privacyStatus": type
                }
            }
        }
    )

    const translationId = res.data.id;
    if (res.statusText !== 'OK' || !translationId) {
        console.log('RESPONSE', JSON.stringify(res, null, 2));

        throw new Error('translation not create');
    }
    TRANSLATION_ID = translationId;

    const bindStream = await google.youtube({version: 'v3', auth: oAuth2Client}).liveBroadcasts.bind({
        "part": [
            "snippet,contentDetails,status"
        ],
        id: translationId,
        streamId: streamInfo.id
    })

    if (bindStream.statusText !== 'OK') {
        console.log('BindStream RESPONSE', JSON.stringify(res, null, 2));

        throw new Error('bindStream error');
    }


    console.log(`Translation create`, `https://www.youtube.com/watch?v=${translationId}`);

    runffmpeg(cameraUrl, streamInfo.url);
}

process.on('SIGINT', async () => {
    console.log('Exit. Stop translation, please wait');
    if (TRANSLATION_ID) {
        const res = await google.youtube({version: 'v3', auth: getAuthClientByToken()}).liveBroadcasts.transition({
            "part": [
                "snippet,contentDetails,status"
            ],
            id: TRANSLATION_ID,
            broadcastStatus: 'complete'
        })

        if (res.statusText !== 'OK') {
            console.log('STOP TRANSLATION ERROR', JSON.stringify(res, null, 2))
        }
    }

    process.exit();
})

main(getEnv('STREAM_NAME'), getEnv('STREAM_KEY'), getEnv('CAMERA_RTSP_URL'), 'private');
