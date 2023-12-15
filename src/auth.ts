import readline from "readline";
import {URL} from "url";
import {getAuthClient} from "./utils/auth";

const SCOPES: Array<string> = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

function getCodeFromUrlLine(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve, reject) => {
    rl.question("Insert redirect url(http://localhost:8080/...):", (answer) => {
      rl.close();
      const code = new URL(answer, "http://localhost/").searchParams.get("code");
      if (!code) {
        reject(`No code in url: ${answer}`);
        return;
      }

      resolve(code.trim());
    });
  });
}

async function auth() {
  const oAuth2Client = getAuthClient();

  const authorizationUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
  });

  console.log("Open link: ", authorizationUrl);
  const code = await getCodeFromUrlLine();
  const token = await oAuth2Client.getToken(code);
  if (token.res?.statusText !== "OK") {
    console.log("Get access token error", JSON.stringify(token, null, 2));
  }

  console.log("Paste it into the .env:");
  console.log(`YOUTUBE_ACCESS_TOKEN=${token.tokens.access_token}`);
  console.log(`YOUTUBE_REFRESH_TOKEN=${token.tokens.refresh_token}`);
}

auth().catch((e) => console.log("Global error:", e));
