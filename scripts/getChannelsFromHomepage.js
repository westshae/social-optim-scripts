import puppeteer from 'puppeteer';
import { pageWithoutMedia, autoScroll } from './helper.js';

async function getChannelsFromHomepage() {
  const browser = await puppeteer.launch({headless:false});
  let page = await pageWithoutMedia(browser);
  page.goto("https://www.youtube.com/");

  await page.waitForSelector('#contents');
  await autoScroll(page, Math.random() * (361824 - 235955) + 235955);

  let links = await getAllChannelLinks(page);
  
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
        return {href:anchor.href};
      }
    });
  }, videoEndpoints);

  //Removes any null values from the .map function.
  let videoIds = [];
  links.forEach((value) => {
    if(value != null)
      videoIds.push(value);
  });

  return videoIds;
}

export default getChannelsFromHomepage;