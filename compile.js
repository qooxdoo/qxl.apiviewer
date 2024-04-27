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

qx.Class.define("qxl.apiviewer.compile.LibraryApi", {
  extend: qx.tool.cli.api.LibraryApi,
  members: {
    async load() {
      let command = this.getCompilerApi().getCommand();
      if (command instanceof qx.tool.cli.commands.Compile) {
        command.addListener("writingApplication", async function(e) {
          let appMeta = e.getData().appMeta;
          let application = appMeta.getApplication();
          let className = application.getClassName();
          if (className !== "qxl.apiviewer.Application") {
            return;
          }
          let command = this.getCompilerApi().getCommand();
          let maker = command.getMakersForApp(application.getName())[0];
          let analyser = maker.getAnalyser();
          let lib = analyser.findLibrary("qxl.apiviewer");
          const folder = path.join(lib.getRootDir(), lib.getSourcePath(), "qxl/apiviewer/dao");
          // preload depend classes
          require(path.join(folder, "Node.js"));
          require(path.join(folder, "ClassItem.js"));
          // load the rest
          fs.readdirSync(folder).forEach(file => {
            if (path.extname(file) === ".js") {
              require(path.join(folder, file));
            }
          });
          require(path.join(lib.getRootDir(), lib.getSourcePath(), "qxl/apiviewer/ClassLoader.js"));
          require(path.join(lib.getRootDir(), lib.getSourcePath(), "qxl/apiviewer/CreateClassDb.js"));
          require(path.join(lib.getRootDir(), lib.getSourcePath(), "qxl/apiviewer/RequestUtil.js"));
          
          let target = maker.getTarget();
          let outputDir = target.getOutputDir();
          outputDir = path.join(outputDir, "resource", qxl.apiviewer.ClassLoader.RESOURCEPATH);
          let environment = appMeta.getEnvironment();
          let excludeFromAPIViewer = environment["qxl.apiviewer.exclude"];
          let includeToAPIViewer = environment["qxl.apiviewer.include"];
          let verbose = command.argv.verbose;
          let builder = new qxl.apiviewer.CreateClassDb;
          await builder.buildAPIData({
            outputDir, 
            verbose, 
            includeToAPIViewer, 
            excludeFromAPIViewer
          });
  
        }, this);
      }
      return this.base(arguments);
    }
  }
});

module.exports = {
  LibraryApi: qxl.apiviewer.compile.LibraryApi,
  CompilerApi: qxl.apiviewer.compile.CompilerApi
};
