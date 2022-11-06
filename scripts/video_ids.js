import puppeteer from 'puppeteer';

async function getVideoIds(channelUrl){
  const browser = await puppeteer.launch({headless:true});

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  //Prevents any unnecessary resources being downloaded, especially images & videos
  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
        request.abort();
    } else if (request.resourceType() === 'video') {
      request.abort();
    } else {
      request.continue();
    }
  });

  //Loads channel and waits for video grid content to load
  await page.goto(channelUrl);
  await page.waitForSelector('#contents');

  //Scrolls from the top of the page to the bottom, waiting a short interval for it to load the new section of dynamic content
  await autoScroll(page);

  //Returns all video data from the channel.
  let links = await getAllVideoData(page);

  browser.close();

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

  //Removes any null values from the .map function.
  let videoIds = [];
  links.forEach((value) => {
    if(value != null)
      videoIds.push(value);
  });

  return videoIds;
}

//Scrolls from the top of the page to the bottom then stops
async function autoScroll(page){
  await page.evaluate(async () => {
    let prevScrollY = 0;
    let scrollCount = 0;

    await new Promise((resolve) => {
      //At a set interval, scroll down 2500px's
      //If the scroll height is the same 20 intervals in a row, end loop.
      //Else If the scroll height is the same as the last loop, increase the 'same count'
      //Else, they aren't the same, reset the counter;
      var timer = setInterval(() => {
          window.scrollBy(0, 2500);

          if(scrollCount == 20){
            clearInterval(timer);
            resolve();
          } else if(window.scrollY == prevScrollY){
            scrollCount++;
          } else {
            scrollCount = 0;
          }

          prevScrollY = window.scrollY;
      }, 100);
    });
  });
}

export default getVideoIds;