import "dotenv/config";
import { downloadIndividualImage } from "./scripts/downloadImages.js";
import getAllVideoData from "./scripts/getAllVideoIds.js";
import getChannelsFromHomepage from "./scripts/getChannelsFromHomepage.js";
import { convertChannelLinksToSingleList, saveToJsonFile } from "./scripts/helper.js";

const channelLinks = await getChannelsFromHomepage();
saveToJsonFile(channelLinks, "channelLinks")
const channelVideos = await getAllVideoData(channelLinks);
const videoLinks = convertChannelLinksToSingleList(channelVideos);
console.log(videoLinks.length);

// downloadIndividualImage("https://i.ytimg.com/vi/G7lZGc6g4ns/hq720.jpg");