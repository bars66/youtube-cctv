# A simple video surveillance script using youtube as a free video surveillance server
- YouTube broadcast
- Accessibility from anywhere in the world
- Free video backup

YouTube limits the number of broadcasts, maximum number of cameras:

## Requirements
- onvif ip camera supporting H264 streaming
- node 16

## Install
1. `npm install`
2. `npm run build`

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
12. Run `node build/auth.js` to get an oauth2 token to access youtube

## Camera broadcast
Run: `STREAM_NAME='CCTV 1' STREAM_KEY=cam1 CAMERA_RTSP_URL="rtsp://admin:password@192.168.1.1:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif" node build/index.js`
- `STREAM_NAME` - broadcast name
- `STREAM_KEY` - YouTube broadcast key, if it doesn't exist, it will be created at startup.
- `CAMERA_RTSP_URL` - rtsp stream from camera
