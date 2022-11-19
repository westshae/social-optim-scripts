import {exec} from "child_process";
import * as fs from "fs";

async function pageWithoutMedia(browser){
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
//If height isn't equal to -1, scroll until pageY == height
async function autoScroll(page, height = -1){
  await page.evaluate(async (height) => {
    let totalScrollCount = 0;
    let prevScrollY = 0;
    let scrollCount = 0;

    await new Promise((resolve) => {
      //At a set interval, scroll down 2500px's
      //If the scroll height is the same 20 intervals in a row, end loop.
      //Else If the scroll height is the same as the last loop, increase the 'same count'
      //Else, they aren't the same, reset the counter;
      var timer = setInterval(() => {
          if(totalScrollCount > 143){
            clearInterval(timer);
            resolve();
          }

          window.scrollBy(0, Math.random() * (2744 - 2157) + 2157);

          if(height == -1){
            if(scrollCount == 20){
              clearInterval(timer);
              resolve();
            } else if(window.scrollY == prevScrollY){
              scrollCount++;
            } else {
              scrollCount = 0;
            }
          } else {
            if(window.scrollY > height || scrollCount == 20) {
              clearInterval(timer);
              resolve();
            } else if(window.scrollY == prevScrollY){
              scrollCount++;
            } else {
              scrollCount = 0;
            }
          }
          

          prevScrollY = window.scrollY;
          totalScrollCount++;
      }, Math.random() * (123 - 74) + 74);
    });
  },height);
}

function convertChannelLinksToSingleList(listOfChannels){
  let toReturn = [];
  for(let channel of listOfChannels){
    if(channel != null){
      console.log(channel);
      for(let link of channel.videoList){
        if(link != null){
          toReturn.push(link);
        }
      }
    }
  }
  return toReturn;
}

function saveToJsonFile(json, fileName) {
  fileName += ".json"
  fs.writeFile(fileName, JSON.stringify(json), () => {});
}

export {pageWithoutMedia, startTorClient, autoScroll, convertChannelLinksToSingleList,saveToJsonFile}