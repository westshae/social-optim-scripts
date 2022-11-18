import puppeteer from 'puppeteer';
import { pageWithoutMedia, autoScroll } from './helper.js';

async function getVideoIds(channelUrl){
  // Tor to prevent ip banning if required
  // startTor();
  // const browser = await puppeteer.launch({
  //   args: ['--proxy-server=socks5://127.0.0.1:9050'],
  //   headless: false,
  // })
  
  // const browser = await puppeteer.launch({headless:false});
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

//     const n = await page.$("#txt")
// const t = await (await n.getProperty('textContent')).jsonValue()

    // const subscribers = await ((await page.$("#subscriber-count")).getProperty('textContent')).jsonValue();
    const subscribers = await (await (await page.$('#subscriber-count')).getProperty('innerHTML')).jsonValue();
    console.log(subscribers);
    const channelSelector = ".ytd-channel-name"
    const channelName = await page.evaluate(channelSelector => {
      return [...document.querySelectorAll(channelSelector)].map(anchor => {
        return anchor;
      });
    }, channelSelector);

    console.log(channelName);

    // console.log(await page.$('.ytd-channel-name')).getProperty('innerHTML')

    // console.log(await (await page.$('.ytd-channel-name')).getProperty('innerHTML'))

    // const channelName = await (await (await page.$('.ytd-channel-name')).getProperty('innerHTML')).jsonValue().trim();
    // console.log(channelName);

    // const links = await page.evaluate(videoEndpoints => {
    //   return [...document.querySelectorAll(videoEndpoints)].map(anchor => {
    //     if(anchor != null && anchor.href != null && anchor.href.includes('/channel/')){        
    //       return anchor.href;
    //     }
    //   });
    // }, videoEndpoints);

    // let channelSubscribers = (await page.$('#subscriber-count')).getProperty('innerHTML');;
    // // .replace(',', "");
    // let channelName = (await page.$('.ytd-channel-name')).getProperty('innerHTML');;
    // console.log(channelName);
    // console.log(channelSubscribers);


    //Removes any null values from the .map function.
    let videoIds = [];
    links.forEach((value) => {
      if(value != null)
        videoIds.push(value);
    });

    return videoIds;
  } catch(e){
    console.log(e);
    return null;
  }
}


export default getVideoIds;