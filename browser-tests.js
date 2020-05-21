// Test application in headless Chrome and Firefox
// see https://github.com/microsoft/playwright/blob/master/docs/api.md

const playwright = require('playwright');
const assert = require('assert').strict;
const process = require('process');

let nodes = ["Packages", "data", "ui"];



(async () => {
  try {
    for (const browserType of ['chromium', 'firefox' /*, 'webkit'*/]) {
      console.info("Running test in " + browserType);
      const launchArgs = {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };
      const browser = await playwright[browserType].launch(launchArgs);
      const context = await browser.newContext();
      const page = await context.newPage();
      page.on("pageerror", exception => {
        console.error("Error on page " + page.url());
        throw exception;
      });
      await page.goto('http://localhost:8080');
      let url = page.url();
      for (const node of nodes) {
        console.info(` >>> Clicking on node '${node}'`);
        await page.click(`.qx-main >> text=${node}`);
        for (let i=0; i<10; i++) {
          await page.keyboard.press("ArrowDown");
          await page.waitForTimeout(500);
          // assert that url hash has changed
          assert.notEqual(page.url(), url);
          url = page.url();
          console.log( " - " + url);
        }
      }
      await browser.close();
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
