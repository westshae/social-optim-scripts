import "dotenv/config";
import getAllVideoData from "./scripts/getAllVideoIds.js";
import getChannelsFromHomepage from "./scripts/getChannelsFromHomepage.js";
import { convertChannelLinksToSingleList } from "./scripts/helper.js";

const channelLinks = await getChannelsFromHomepage();
const channelVideos = await getAllVideoData(channelLinks);
const videoLinks = convertChannelLinksToSingleList(channelVideos);
console.log(videoLinks.length);