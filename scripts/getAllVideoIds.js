import getVideoIds from "./getVideoIds.js";

async function getAllVideoData(links){
  let channels = [];

  for(let link of links){
    channels.push(await getVideoIds(link + "/videos"))
  }
  console.log(channels);

  return channels;
}

export default getAllVideoData;