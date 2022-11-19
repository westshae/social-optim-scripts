import puppeteer from 'puppeteer';
import { pageWithoutMedia, autoScroll, saveToJsonFile } from './helper.js';

async function getChannelsFromHomepage() {
  // const browser = await puppeteer.launch({headless:false});
  const browser = await puppeteer.launch();

  let page = await pageWithoutMedia(browser);
  page.goto("https://www.youtube.com/");

  await page.waitForSelector('#contents');
  await autoScroll(page, Math.random() * (361824 - 235955) + 235955);

  let links = await getAllChannelLinks(page);
  console.log("ChannelLinkCount::" + links.length);


  browser.close();

  return links;
}

//For each video on the page, return its information
async function getAllChannelLinks(page){
  //Ensures videos exist on the page
  const videoEndpoints = '.yt-simple-endpoint';
  await page.waitForSelector(videoEndpoints);

  //For each element that matches '.yt-simple-endpoint'
  //If element is an anchor that has a link of a youtube video and an aria-label
  //Save link, title, views & id into a object to return.
  const links = await page.evaluate(videoEndpoints => {
    return [...document.querySelectorAll(videoEndpoints)].map(anchor => {
      if(anchor != null && anchor.href != null && anchor.href.includes('/channel/')){        
        return anchor.href;
      }
    });
  }, videoEndpoints);

  //Removes any null values from the .map function.
  let channelLinks = [];
  links.forEach((value) => {
    if(value != null)
    channelLinks.push(value);
  });

  let uniqueChannelLinks = channelLinks.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
  });
  saveToJsonFile(channelLinks, "channelLinks")

  return uniqueChannelLinks;
}

export default getChannelsFromHomepage;