#! /usr/bin/env node
function build() {

  const fs = require('fs')
  const path = require('path')
  const chalk = require('chalk')
  const inquirer = require("inquirer")
  const NZSH_BUILDS = path.resolve('./builds')

  try {
    if (fs.existsSync(NZSH_BUILDS) !== true) {
      fs.mkdir(`${NZSH_BUILDS}`, error => {
        if (error)
          throw error;
      })
    }
  } catch(e) {
    console.log("An error occurred.")
  }

  const initialQuestions = [
    {
      name: 'addScript',
      message: 'What type of script do you want to build?',
      type: 'list',
      choices: [
        'over_ssh',
        'internal'
      ]
    },
    {
      name: 'fileName',
      message: 'Name your file:',
      type: 'input'
    }
  ]

  const sshQuestions = [
    {
      name: 'directory',
      message: 'After ssh, what is the path to the directory you want to run the script in?',
      type: 'input'
    },
    {
      name: 'username',
      message: 'ssh name:',
      type: 'input'
    },
    {
      name: 'address',
      message: 'ssh address:',
      type: 'input'
    }
  ]

  const q_addCustom = [
    {
      name: 'add_custom',
      message: 'Type the command you want to execute:',
      type: 'input'
    }
  ]

  const q_addConfirm = [
    {
      name: 'addConfirm',
      message: 'Add Command:',
      type: 'list',
      choices: [
        {
          name: 'Add Built in Command',
          value: 'builtIn'
        },
        {
          name: 'Write Command',
          value: 'custom'
        },
        {
          name: 'Exit & Build (no command / exit and build)',
          value: 'exit'
        }
      ]
    }
  ]

  const q_addBuiltIn = [
    {
      name: 'addBuiltIn',
      message: 'Add Built In Command:',
      type: 'list',
      choices: [
        'if_npm_install_should_run',
        'pm2',
        'git_pull'
      ]
    }
  ]

  const nzsh_npmTest = '\ngit diff --name-only HEAD@{1} HEAD \nIFS=$"\\n" \nPACKAGE_REGEX="(^package\\.json)" \nPACKAGE=("$(git diff --name-only HEAD@{1} HEAD | grep -E "$PACKAGE_REGEX")") \nif [[ ${PACKAGE[@]} ]]; then \n\techo "📦 package.json was changed. Running npm install to update dependencies..." \n\tnpm install \nfi';
  const nzsh_gitPull = '\ngit pull origin';
  const nzsh_pm2 = '\npm2 restart all';

  let write = '#!/bin/zsh';
  let fileName = '';
  let scriptType = '';
  let user = '';
  let address= '';

  const buildFile = ()=> {
    let exportFileName = fileName.includes('.zsh') ? fileName : `${fileName}.zsh`;
    if (scriptType === 'over_ssh')
      write += `\' \nssh ${user}@${address} $sendfunc \n`;
    fs.writeFile(`${NZSH_BUILDS}/${exportFileName}`, write, (err)=> {
      if (err) throw err;
      console.log(
        chalk.magentaBright.bold(`${exportFileName}______________________________________\n`),
        chalk.greenBright('successful\n'),
        chalk.cyanBright('folder:'),
        `${NZSH_BUILDS}`,
      )
      fs.chmod(`${NZSH_BUILDS}/${exportFileName}`, 0o755, (err)=> {
        if (err) throw err
        console.log(chalk.cyanBright('file can execute'));
      })
    })
  }

  const questionCustom = ()=> {
    inquirer
      .prompt( q_addCustom )
      .then(a_addCustom => {
        write += `\n${a_addCustom.add_custom}`;
        questionAddCommand()
      })
  }

  const questionBuiltIn = ()=> {
    inquirer
      .prompt( q_addBuiltIn )
      .then(a_builtIn => {
        if (a_builtIn.addBuiltIn === 'if_npm_install_should_run') {
          write += nzsh_npmTest;
          questionAddCommand()
        } else if (a_builtIn.addBuiltIn === 'git_pull') {
          write += nzsh_gitPull;
          questionAddCommand()
        }
        else if (a_builtIn.addBuiltIn === 'pm2') {
          write += nzsh_pm2;
          questionAddCommand()
        }
      })
  }

  const questionAddCommand = ()=> {
    inquirer
      .prompt( q_addConfirm )
      .then(a_addCommandConfirm => {
        if (a_addCommandConfirm.addConfirm === 'builtIn')
          questionBuiltIn()
        else if (a_addCommandConfirm.addConfirm === 'custom')
          questionCustom()
        else if (a_addCommandConfirm.addConfirm === 'exit')
          buildFile(fileName)
      })
  }

  inquirer
    .prompt( initialQuestions )
    .then(answer => {
      scriptType += answer.addScript;
      fileName += answer.fileName;
      if (scriptType === 'over_ssh') {
        inquirer
          .prompt( sshQuestions )
          .then(sshAnswer => {
            user += sshAnswer.username;
            address += sshAnswer.address;
            const nzsh_cd = `\nsendfunc=\'cd ${sshAnswer.directory}`;
            write += nzsh_cd;
            questionAddCommand()
          })
      } else {
        questionAddCommand()
      }
    })

}
module.exports = build