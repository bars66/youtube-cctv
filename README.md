# A simple script using youtube as a free video surveillance server
- YouTube broadcast
- Accessibility from anywhere in the world
- Free video backup


YouTube limits the number of broadcasts, maximum number of cameras:

## Requirements
- ip camera supporting H264/H265 streaming
- node 16
- ffmpeg

## Install
1. [Install](https://nodejs.org/en/download/package-manager) node 16 or higher
2. Install ffmpeg
3. Install package `npm install -g youtube-cctv-stream`

<details>
  <summary>Install from source</summary>

  1. `npm install`
  2. `npm run build`
  3. Use `npm start` to run

</details>

## Getting a token to access youtube
Full official instructions from Google: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps?hl=en#creatingclient
1. Go to the google cloud console: https://console.cloud.google.com/
2. Create a project
3. open Api&Services
4. Then click on Enable apis and services
5. Find "youtube data api v3"
6. Open and click Enable
7. Go to credentials
8. Click on Create credentials and select OAuth client id
9. Select the following scope:
```
   YouTube Data API v3 .../auth/youtube.readonly View your YouTube account
   YouTube Data API v3 .../auth/youtube Manage your YouTube account
   YouTube Data API v3 .../auth/youtube.force-ssl See, edit, and permanently delete your YouTube videos, ratings, comments, and captions.
```
10. Add yourself to test users
10. Specify Authorized redirect URIs: http://localhost:8080
11. Copy Client ID and Client secret to .env:
```dotenv
GOOGLE_CLIENT_ID=<...Client ID...>
GOOGLE_CLIENT_SECRET=<... Client secret  ...>
GOOGLE_REDIRECT_URL="http://localhost:8080"
```
12. Run `youtube-cctv-stream auth` to get an oauth2 token to access youtube

## Camera broadcast
Run: 
```
STREAM_NAME='CCTV 1' STREAM_KEY=cam1 CAMERA_RTSP_URL="rtsp://admin:password@192.168.1.1:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif" youtube-cctv-stream stream
```
Envs:
- `STREAM_NAME` (required) - broadcast name
- `STREAM_KEY` (required) - YouTube broadcast key, if it doesn't exist, it will be created at startup.
- `CAMERA_RTSP_URL` (required) - rtsp stream from camera
- `STREAM_TYPE` - Ingestion type (see RTMP or HLS)
  - `rtmp` (default)
  - `hls`
- `STREAM_PRIVACY_TYPE` - Broadcast privacy
  - `private` (default) - access only for your account
  - `unlisted` - available via link
- `LIVE_TIME` - Time in milliseconds, number. By default, one stream is created and goes "forever". Rewind to 12 hours backwards is available. If you need an archive record, set `43140000` (11 hours and 59 minutes). Then every 12 hours a new stream will be created, and the previous one will be saved to your account 

## RTMP or HLS
- **rtmp** supports only H264, but has the lowest latency ~5s
- **hls** supports H264 and H265, but the delay is up to ~20-30s.

If your camera broadcasts video in H264, choose rtmp. 

