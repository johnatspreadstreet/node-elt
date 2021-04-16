import { Logger } from '@node-elt/singer-js';

const fs = require('fs-extra');
const path = require('path');
const json2csv = require('json2csv').parse;

export const write = async (data, { fileName }) => {
  // output file in the same folder
  const ext = path.extname(fileName);
  console.log(ext);
  const filename = path.join(process.cwd(), `${fileName}`);

  let rows;
  // If file doesn't exist, we will create new file and add rows with headers.
  if (!fs.existsSync(filename)) {
    await fs.ensureFileSync(filename);
    // rows = json2csv(data, { header: true });
    rows = data;
  } else {
    // Rows without headers.
    // rows = json2csv(data, { header: false });
    rows = data;
  }

  // Append file function can create new file too.
  fs.appendFileSync(filename, rows);
  // Always add new line if file already exists.
  fs.appendFileSync(filename, '\r\n');
};
