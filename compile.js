const fs = require("fs");
const path = require("path");
const assert = require("assert").strict;

qx.Class.define("qxl.apiviewer.compile.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    async load() {
      this.addListener(
        "changeCommand",
        function () {
          let command = this.getCommand();
          if (command instanceof qx.tool.cli.commands.Test) {
            command.addListener("runTests", this.__appTesting, this);
            if (command.setNeedsServer) {
              command.setNeedsServer(true);
            }
          }
        },
        this
      );
      return this.base(arguments);
    },

    // Test application in headless Chrome and Firefox
    // see https://github.com/microsoft/playwright/blob/master/docs/api.md
    __appTesting: async function (data) {
      let result = data.getData();
      let nodes = ["Packages", "data", "ui"];
      let href = `http://localhost:8080/`;

      return new qx.Promise(async function (resolve) {
        try {
          const playwright = this.require("playwright");
          for (const browserType of ["chromium", "firefox" /*, 'webkit'*/]) {
            console.info("APIVIEWER: Running test in " + browserType);
            const launchArgs = {
              args: ["--no-sandbox", "--disable-setuid-sandbox"]
            };
            const browser = await playwright[browserType].launch(launchArgs);
            const context = await browser.newContext();
            const page = await context.newPage();
            page.on("pageerror", exception => {
              qx.tool.compiler.Console.error(`Error on page ${page.url()}: ${exception}`);
              result.setExitCode(1);
              resolve();
            });
            await page.goto(href);
            let url = page.url();
            for (const node of nodes) {
              qx.tool.compiler.Console.info(` >>> Clicking on node '${node}'`);
              await page.click(`.qx-main >> text=${node}`);
              for (let i = 0; i < 10; i++) {
                await page.keyboard.press("ArrowDown");
                await page.waitForTimeout(1000);
                // assert that url hash has changed
                assert.notEqual(page.url(), url);
                url = page.url();
                qx.tool.compiler.Console.log(" - " + url);
              }
            }
            await browser.close();
          }
          resolve();
        } catch (e) {
          qx.tool.compiler.Console.error(e);
          result.setExitCode(1);
          resolve();
        }
      }, this);
    }
  }
});

module.exports = {
  CompilerApi: qxl.apiviewer.compile.CompilerApi
};
