import "dotenv/config";
import getAllVideoData from "./scripts/getAllVideoIds.js";
import getChannelsFromHomepage from "./scripts/getChannelsFromHomepage.js";

const links = await getChannelsFromHomepage();
const channels = await getAllVideoData(links);
console.log(channels.length);
let count = 0;
for(let video of channels){
  if(video){
    count += video.length;
  }
}
console.log(count);