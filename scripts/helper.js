

async function pageWithoutMedia(browser){
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  let totalBytes = 0

  page.on('response', response => {
      let headers = response.headers()
      if ( typeof headers['content-length'] !== 'undefined' ){
          var length = parseInt( headers['content-length'] )
          totalBytes+= length
      }
  })


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

  return page;
}

//Starts a local tor client
async function startTorClient(){
  exec('sudo tor', (error, stdout, stderr) => {
    if(!(error || stderr)){
      console.error("Command 'sudo tor' failed, please install tor package.")
    }
    console.log("Tor launch successful")
  });
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
          window.scrollBy(0, Math.random() * (2744 - 2157) + 2157);

          if(scrollCount == 20){
            clearInterval(timer);
            resolve();
          } else if(window.scrollY == prevScrollY){
            scrollCount++;
          } else {
            scrollCount = 0;
          }

          prevScrollY = window.scrollY;
      }, Math.random() * (123 - 74) + 74);
    });
  });
}


export {pageWithoutMedia, startTorClient, autoScroll}