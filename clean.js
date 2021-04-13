// 1. Change path of git bash to lowercase c in VS Code settings and reload
// 2. Run `rm -rf node_modules/`
// 3. Delete yarn.lock and yarn-error.log in root folder
// 4. Run `yarn`
// 5. Run `yarn sync`
// 6. Run `yarn bootstrap`

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout || stderr);
    });
  });
}

async function fullClean() {
  // Step 1: Remove Node Modules
  console.log('Removing node modules...');
  await execShellCommand('rm -rf node_modules/');

  // Step 2: Remove package-lock.json
  console.log('Removing package-lock...');
  await execShellCommand('rm -rf package-lock.json');

  // Install prerequisites
  console.log('Installing pre-requisites...');
  await execShellCommand('npm i -g execa yargs ora');

  // Step 3: Run `yarn`
  console.log('Installing packages...');
  await execShellCommand('npm i');
}

fullClean();
