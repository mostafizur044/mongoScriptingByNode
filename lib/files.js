const fs = require('fs');
const path = require('path');

module.exports = {
  getCurrentDirectoryPath: () => {
        return process.cwd();
  },
  changeCurrentDirectoryPath: (pathName) => {
    process.chdir(pathName);
  },
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },
  getParentDirectory: () => {
    return path.resolve(__dirname, '..', '..');
  },
  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },
  getFileList: (filePath) => {
    return fs.readdirSync(filePath);
  } 
};