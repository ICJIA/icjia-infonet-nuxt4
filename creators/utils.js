/**
 * Utility functions for creator scripts
 * Provides file system operations and data processing utilities
 * @module creators/utils
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");
const path = require("path");

/**
 * Recursively find files in a directory matching a filter pattern
 * @function findInDir
 * @param {string} dir - Directory path to search
 * @param {RegExp} filter - Regular expression to match file paths
 * @param {Array} [fileList=[]] - Accumulator array for results
 * @returns {Array<string>} Array of file paths matching the filter
 * @example
 * const jsFiles = findInDir('./app', /\.js$/);
 * console.log(jsFiles); // ['/app/file1.js', '/app/file2.js', ...]
 */
const findInDir = function (dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.lstatSync(filePath);

    if (fileStat.isDirectory()) {
      findInDir(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

/**
 * Save data as JSON to a file
 * @function saveJson
 * @param {*} data - Data to serialize and save
 * @param {string} filePath - Path where JSON file will be saved
 * @throws {Error} Logs error if file write fails
 * @example
 * const data = { name: 'InfoNet', version: '4.0' };
 * saveJson(data, './app/data/config.json');
 */
const saveJson = (data, filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

/**
 * Recursively walk through directory tree and execute callback for each file
 * @function walkSync
 * @param {string} currentDirPath - Starting directory path
 * @param {Function} callback - Function to execute for each file
 * @param {string} callback.filePath - Path to the current file
 * @param {Object} callback.stat - File stat object
 * @example
 * walkSync('./app', (filePath, stat) => {
 *   console.log(`Processing: ${filePath}`);
 * });
 */
const walkSync = function (currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
};

/**
 * Filter out falsy values from an array
 * @function filterUndefined
 * @param {Array} arr - Array to filter
 * @returns {Array} New array with falsy values removed
 * @example
 * const mixed = [1, null, 'text', undefined, 0, 'more'];
 * const filtered = filterUndefined(mixed);
 * console.log(filtered); // [1, 'text', 'more']
 */
const filterUndefined = function (arr) {
  const temp = [];
  for (const i of arr) i && temp.push(i);
  return temp;
};

/**
 * Blacklist of file names and extensions to exclude from processing
 * @type {Array<string>}
 * @constant
 */
const blacklist = [
  ".DS_Store",
  "placeholder.png",
  "placeholder.json",
  "placeholder.md",
  "_headers",
  "robots.txt",
  "404.html",
  "json",
  "ico",
  "jpg",
  "png",
];

module.exports = {
  findInDir,
  saveJson,
  walkSync,
  filterUndefined,
  blacklist,
};
