#! /usr/bin/env node
function run(runFile) {

  const fs = require('fs')
  const path = require('path')
  const { exec } = require('child_process')
  const inquirer = require("inquirer")

  const NZSH_BUILDS = path.resolve('./builds')

  if (runFile && runFile !== '') {
    let exportFileName = runFile.includes('.zsh') ? runFile : `${runFile}.zsh`;
    let nzshScript = NZSH_BUILDS + '/' + exportFileName;
    exec(nzshScript, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    })
  } else {
    fs.readdir(`${NZSH_BUILDS}`, (err, _files)=> {
      if (err)
        throw err;
      else {
        inquirer.prompt([
          { name: 'execute', message: 'Choose Script to Execute:', type: 'list', choices: _files },
        ])
        .then(answer => {
          let nzshScript = NZSH_BUILDS + '/' + answer.execute;
          exec(nzshScript, (err, stdout, stderr) => {
            if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          })
        })
      }
    })
  }

}
module.exports = run