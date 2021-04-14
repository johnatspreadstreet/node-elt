const fs = require('fs-extra');
const path = require('path');
const json2csv = require('json2csv').parse;

export const write = async (fileName, fields, data) => {
  // output file in the same folder
  const filename = path.join(process.cwd(), `${fileName}`);

  let rows;
  // If file doesn't exist, we will create new file and add rows with headers.
  if (!fs.existsSync(filename)) {
    await fs.ensureFileSync(filename);
    rows = json2csv(data, { header: true });
  } else {
    // Rows without headers.
    rows = json2csv(data, { header: false });
  }

  // Append file function can create new file too.
  fs.appendFileSync(filename, rows);
  // Always add new line if file already exists.
  fs.appendFileSync(filename, '\r\n');
};
