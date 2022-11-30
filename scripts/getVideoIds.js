import puppeteer from 'puppeteer';
import { pageWithoutMedia, autoScroll, saveToJsonFile } from './helper.js';

async function getVideoIds(channelUrl){
  try{
    const browser = await puppeteer.launch({args: ['--disable-dev-shm-usage']});

    let page = await pageWithoutMedia(browser);

    //Loads channel and waits for video grid content to load
    await page.goto(channelUrl);
    await page.waitForSelector('#contents');

    //Scrolls from the top of the page to the bottom, waiting a short interval for it to load the new section of dynamic content
    await autoScroll(page);

    //Returns all video data from the channel.
    let links = await getAllVideoData(page);


    browser.close();

    console.log("Scrape data::" + channelUrl);
    if(links){
      console.log("Total Video Links: " + links.length);
    } else {
      console.log("Channel scrape failed::");
    }

    return links;
  }catch(e){}
}

//For each video on the page, return its information
async function getAllVideoData(page){

  //Finds the element, gets the textContent property.
  const subscribers = await (await (await page.$('#subscriber-count')).getProperty('textContent')).jsonValue();
  const channelName = await (await (await (await page.$('#channel-name')).$('#text')).getProperty('textContent')).jsonValue();

  let hasDecimalPoint = subscribers.includes('.');

  let letter = subscribers.includes('M') ? 'M' : null;
  if(letter == null)
    letter = subscribers.includes('K') ? 'K' : ' ';

  let formattedSubNumber = parseInt(subscribers.split(letter)[0].replace('.', ''));
  switch(letter){
    case 'M':
      formattedSubNumber *= 1000000;
      break;
    case 'K':
      formattedSubNumber *= 1000;
      break;
  }
  if(hasDecimalPoint){
    formattedSubNumber /= 10;
  }

  
  //Ensures videos exist on the page
  const videoEndpoints = '.yt-simple-endpoint';
  await page.waitForSelector(videoEndpoints);

  //For each element that matches '.yt-simple-endpoint'
  //If element is an anchor that has a link of a youtube video and an aria-label
  //Save link, title, views & id into a object to return.
  try {
    const links = await page.evaluate((videoEndpoints, formattedSubNumber, channelName) => {
      return [...document.querySelectorAll(videoEndpoints)].map(anchor => {
        if(anchor != null && anchor.href.includes('/watch?v=') && anchor.getAttribute('aria-label') != null){
          let split = anchor.getAttribute('aria-label').split(" ");
          let title = anchor.getAttribute('title');
          let views = split[split.findIndex(section => section === 'views') - 1].replace(/\D/g, '');
          let id = anchor.href.split("/watch?v=")[1];
          
          return {id:id, title:title, channelName:channelName, subscribers:formattedSubNumber, views:views};
        }
      });
    }, videoEndpoints, formattedSubNumber, channelName);


    //Removes any null values from the .map function.
    let videoIds = [];
    links.forEach((value) => {
      if(value != null)
        videoIds.push(value);
    });

    //Adds video count of youtuber to each video
    videoIds.forEach((value)=>{
      value.channelVideoCount = videoIds.length;
    });

    saveToJsonFile(videoIds,"channels/" + channelName.replace(/\s+/g, "") + 'Data');

    return videoIds;
  } catch(e){
    console.log(e);
    return null;
  }
}


export default getVideoIds;