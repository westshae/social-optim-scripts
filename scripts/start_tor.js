import {exec} from "child_process"

function startTor(){
  exec('sudo tor', (error, stdout, stderr) => {
    if(!(error || stderr)) return;
    console.log(`stdout:\n${stdout}`);
  });
}

export default startTor;