import {OAuth2Client} from "google-auth-library/build/src/auth/oauth2client";
import {google} from "googleapis";
import {getEnv} from "./util";

const CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
const REDIRECT_URL = getEnv('GOOGLE_REDIRECT_URL');

export function getAuthClient(): OAuth2Client {
    return new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URL
    );
}

export function getAuthClientByToken(): OAuth2Client {
    const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URL
    );

    oAuth2Client.setCredentials({
        refresh_token: getEnv('YOUTUBE_REFRESH_TOKEN'),
        access_token: getEnv('YOUTUBE_ACCESS_TOKEN')
    });

    return oAuth2Client;
}
