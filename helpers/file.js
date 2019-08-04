const fs = require('fs');
const path = require('path');

/** Retrieve file paths from a given folder and its subfolders. */
const getFilePaths = (folderPath, exts) => {
  const entryPaths = fs.readdirSync(folderPath).map(entry => path.join(folderPath, entry));
  var filePaths = entryPaths.filter(entryPath => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter(entryPath => !filePaths.includes(entryPath));

  filePaths = entryPaths.filter(entryPath => !exts || exts.includes(path.extname(entryPath).replace('.','')));
  
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(getFilePaths(curr, exts)), []);
  return [...filePaths, ...dirFiles];
};

module.exports = getFilePaths;