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

async function run() {
  await execShellCommand('python -m venv csv');
  await execShellCommand('csv\\Scripts\\activate.bat');
  //   await execShellCommand('pip help');
  await execShellCommand('pip install target-csv');
  await execShellCommand('csv\\Scripts\\deactivate.bat');

  await execShellCommand(
    'node ./bin/tap-cryptunit --config config.json --catalog catalog.json | target-csv'
  );
}

run();
