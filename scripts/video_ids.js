import puppeteer from 'puppeteer';

const count = 0;

async function getVideoIds(channelUrl){
  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({headless:false});
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

  page.on('console', err => console.log('pageerror: '+err));


  await page.goto(channelUrl);
  await page.waitForSelector('.ytd-grid-renderer');
  //class for video link yt-simple-endpoint

  var timer = setInterval(() => {
    autoScroll(page);
    console.log('how many times');
  }, 100);

  

  // const videoEndpoints = '.yt-simple-endpoint';
  // await page.waitForSelector(videoEndpoints);

  // const links = await page.evaluate(videoEndpoints => {
  //   return [...document.querySelectorAll(videoEndpoints)].map(anchor => {
  //     if(anchor.href.includes('/watch?v='))
  //       return anchor.href;
  //   });
  // }, videoEndpoints);

  // const videoIds = [];
  
  // links.forEach((value, index) => {
  //   if(value != null)
  //     videoIds.push(value);
  // });

  // console.log(videoIds);
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

  const videoIds = [];
  
  links.forEach((value, index) => {
    if(value != null)
      videoIds.push(value);
  });

  return videoIds;
}


async function autoScroll(page){
  console.log("how many times")
  var continueScript = true;
  await page.evaluate(async () => {
      // var links = await getAllLinks();
      // count = links.length;
      console.log(count);

      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 5000;
          var timer = setInterval(() => {
            console.log('more');
              var scrollHeight = document.body.scrollHeight;
              // window.querySelector('.circle').scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
              window.scrollBy(0, distance);
              totalHeight += distance;

              
              if(true){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

export default getVideoIds;

// (async () => {
//   const browser = await puppeteer.launch({headless: false});
//   const page = await browser.newPage();

//   await page.goto('https://developers.google.com/web/');

//   // Type into search box.
//   await page.type('.devsite-search-field', 'Headless Chrome');

//   // Wait for suggest overlay to appear and click "show all results".
//   const allResultsSelector = '.devsite-suggest-all-results';
//   await page.waitForSelector(allResultsSelector);
//   await page.click(allResultsSelector);

//   // Wait for the results page to load and display the results.
//   const resultsSelector = '.gsc-results .gs-title';
//   await page.waitForSelector(resultsSelector);

//   // Extract the results from the page.
//   const links = await page.evaluate(resultsSelector => {
//     return [...document.querySelectorAll(resultsSelector)].map(anchor => {
//       const title = anchor.textContent.split('|')[0].trim();
//       return `${title} - ${anchor.href}`;
//     });
//   }, resultsSelector);

//   // Print all the files.
//   // console.log(links.join('\n'));
//   for(var link of links){
//     console.log("Ha" + link);
//   }

//   await browser.close();
// })();