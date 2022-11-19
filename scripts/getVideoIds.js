import puppeteer from 'puppeteer';
import { pageWithoutMedia, autoScroll, saveToJsonFile } from './helper.js';

async function getVideoIds(channelUrl){
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
    console.log("Total Video Links: " + links.videoCount);
  } else {
    console.log("Channel scrape failed::");
  }

  return links;
}

//For each video on the page, return its information
async function getAllVideoData(page){
  //Ensures videos exist on the page
  const videoEndpoints = '.yt-simple-endpoint';
  await page.waitForSelector(videoEndpoints);

  //For each element that matches '.yt-simple-endpoint'
  //If element is an anchor that has a link of a youtube video and an aria-label
  //Save link, title, views & id into a object to return.
  try {
    const links = await page.evaluate(videoEndpoints => {
      return [...document.querySelectorAll(videoEndpoints)].map(anchor => {
        if(anchor != null && anchor.href.includes('/watch?v=') && anchor.getAttribute('aria-label') != null){
          let split = anchor.getAttribute('aria-label').split(" ");
          let link = anchor.href;
          let title = anchor.getAttribute('title');
          let views = split[split.findIndex(section => section === 'views') - 1].replace(',', "");
          let id = link.split("/watch?v=")[1];
          
          return {id:id, link:link, views:views, title:title};
        }
      });
    }, videoEndpoints);

    //Finds the element, gets the textContent property.
    const subscribers = await (await (await page.$('#subscriber-count')).getProperty('textContent')).jsonValue();
    const channelName = await (await (await (await page.$('#channel-name')).$('#text')).getProperty('textContent')).jsonValue();

    //Removes any null values from the .map function.
    let videoIds = [];
    links.forEach((value) => {
      if(value != null)
        videoIds.push(value);
    });

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

    const data = {
      subscribersDisplay: subscribers,
      subscribersValue: formattedSubNumber,
      channelName: channelName,
      videoList: videoIds,
      videoCount: videoIds.length
    }

    saveToJsonFile(data,"channels/" + channelName.replace(/\s+/g, "") + 'Data');

    return data;
  } catch(e){
    console.log(e);
    return null;
  }
}


export default getVideoIds;