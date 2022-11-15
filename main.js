import "dotenv/config";
import getAllVideoData from "./scripts/getAllVideoIds.js";
import getChannelsFromHomepage from "./scripts/getChannelsFromHomepage.js";
import getVideoIds from "./scripts/getVideoIds.js";

const YOUTUBE_CHANNEL_URL = process.env.YOUTUBE_CHANNEL_URL;

let videoIds = await getVideoIds(YOUTUBE_CHANNEL_URL);
console.log(videoIds);

// getAllVideoData();

// getChannelsFromHomepage();