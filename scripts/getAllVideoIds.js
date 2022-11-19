import getVideoIds from "./getVideoIds.js";
import { saveToJsonFile } from "./helper.js";

async function getAllVideoData(links){
  let channels = [];

  for(let link of links){
    channels.push(await getVideoIds(link + "/videos"))
  }
  saveToJsonFile(channels, "general/channelVideos")


  return channels;
}

export default getAllVideoData;