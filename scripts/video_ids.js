import puppeteer from 'puppeteer';

let count = 0;

async function getVideoIds(channelUrl){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
        request.abort();
    } else if (request.resourceType() === 'video') {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto(channelUrl);
  await page.waitForSelector('.ytd-grid-renderer');
  await autoScroll(page);

  let links = await getAllLinks(page);

  browser.close();

  return links;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


async function getAllLinks(page){
  const videoEndpoints = '.yt-simple-endpoint';
  await page.waitForSelector(videoEndpoints);

  const links = await page.evaluate(videoEndpoints => {
    return [...document.querySelectorAll(videoEndpoints)].map(anchor => {
      if(anchor.href.includes('/watch?v='))
        return anchor.href;
    });
  }, videoEndpoints);

  let videoIds = [];
  
  links.forEach((value, index) => {
    if(value != null)
      videoIds.push(value);
  });

  videoIds = videoIds.filter(onlyUnique);

  return videoIds;
}


async function autoScroll(page){
  await page.evaluate(async () => {
    let prevScrollY = 0;
    let scrollCount = 0;

    await new Promise((resolve) => {
      var timer = setInterval(() => {
          window.scrollBy(0, 2500);

          if(scrollCount == 20){
            clearInterval(timer);
          } else if(window.scrollY == prevScrollY){
            scrollCount++;
          } else {
            scrollCount = 0;
          }

          prevScrollY = window.scrollY;
          if(scrollCount == 20){
            clearInterval(timer);
            resolve();
          }
      }, 100);
    });
  });
}

export default getVideoIds;