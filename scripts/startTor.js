import {exec} from "child_process"

function startTor(){
  exec('sudo tor', (error, stdout, stderr) => {
    if(!(error || stderr)){
      console.error("Command 'sudo tor' failed, please install tor package.")
    }
    console.log("Tor launch successful")
  });
}

export default startTor;