import { startTorClient } from "./helper.js";
import * as child from 'child_process';
import * as fs from "fs";




// startTorClient()

async function downloadImages (ids) {
  const torProcess = child.spawn('sudo', ['tor']);
  torProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  torProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  torProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  // DO CODE HERE
  for (let id of ids){
    await downloadIndividualImage(id);
  }

  torProcess.kill();
}

async function downloadIndividualImage (id) {
  const link = "https://i.ytimg.com/vi/" + id + "/hq720.jpg"
  const torify = await child.execFileSync('torify', ['curl', '-0',link]);
  await fs.writeFile(id + ".png", torify,  "binary",function(err) { });
}

export {downloadImages, downloadIndividualImage};