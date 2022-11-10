import "dotenv/config";
import getVideoIds from "./scripts/video_ids.js";

const YOUTUBE_CHANNEL_URL = process.env.YOUTUBE_CHANNEL_URL;

let videoIds = await getVideoIds(YOUTUBE_CHANNEL_URL);
console.log(videoIds);