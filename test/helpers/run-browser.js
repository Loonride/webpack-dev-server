'use strict';

const puppeteer = require('puppeteer');
const { puppeteerArgs } = require('./puppeteer-constants');

async function runBrowser(config) {
  const options = {
    viewport: {
      width: 500,
      height: 500,
    },
    userAgent: '',
    ...config,
  };

<<<<<<< HEAD
  return new Promise((resolve, reject) => {
    let page;
    let browser;

    puppeteer
      .launch({
        headless: true,
        // args come from: https://github.com/alixaxel/chrome-aws-lambda/blob/master/source/index.js
        args: puppeteerArgs,
      })
      .then((launchedBrowser) => {
        browser = launchedBrowser;
        return browser.newPage();
      })
      .then((newPage) => {
        page = newPage;
        page.emulate(options);
        resolve({ page, browser });
      })
      .catch(reject);
=======
  const launchedBrowser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
>>>>>>> test: make use of async/await (#1996)
  });
  const browser = launchedBrowser;
  const page = await browser.newPage();
  page.emulate(options);

  return { page, browser };
}

module.exports = runBrowser;
