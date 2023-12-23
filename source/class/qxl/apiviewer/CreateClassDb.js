const fs = require("fs");
const path = require("upath");

qx.Class.define("qxl.apiviewer.CreateClassDb", {
  extend: qx.application.Basic,

  members: {
    __verbose: false,

    /**
     * @Override
     */
    async main() {
      super.main();
      try {
        await this.__mainImpl();
      } catch (ex) {
        console.error(ex);
      }
    },

    /**
     * Main
     */
    async __mainImpl() {
      let outputDir = path.join(
        qx.util.LibraryManager.getInstance().get("qx", "resourceUri"),
        qxl.apiviewer.ClassLoader.RESOURCEPATH
      );
      // We need the resource directory in the UI app, not the build app
      outputDir = outputDir.replace(/-node\//, "/");

      for (let arg of process.argv) {
        if (arg === "--verbose") {
          this.__verbose = true;
        } else {
          outputDir = arg;
        }
      }

      qxl.apiviewer.ClassLoader.setBaseUri("compiled/meta/");

      const TYPES = {
        class: 1,
        mixin: 1,
        theme: 1,
        interface: 1
      };

      let res = {
        apiindex: {
          fullNames: [],
          index: [],
          types: [
            "doctree",
            "class",
            "package",
            "method_pub",
            "method_prot",
            "event",
            "property_pub",
            "method_priv",
            "method_intl",
            "constant",
            "childControl"
          ]
        },
        classes: []
      };

      function addToIndex(name, typeIdx, nameIdx) {
        if (!res.apiindex.index[name]) {
          res.apiindex.index[name] = [];
        }
        const PACKAGE_ID = 2;
        const isPackageAndWasAlreadyAdded = typeIdx === PACKAGE_ID && res.apiindex.index[name].length;
        // no need to add package more than once
        if (!isPackageAndWasAlreadyAdded) {
          res.apiindex.index[name].push([typeIdx, nameIdx]);
        }
      }

      await qx.tool.utils.Utils.makeDirs(outputDir);

      let metaDb = new qx.tool.compiler.MetaDatabase();
      await metaDb.load();

      // We sort the result so that we can get a consistent ordering for loading classes, otherwise the order in
      //  which the filing system returns the files can cause classes to be loaded in a slightly different sequence;
      //  that would not cause a problem, except that the build is not 100% repeatable.
      let classes = this.getRequiredClasses(metaDb);
      classes.sort();

      for (let classname of classes) {
        let cls;
        try {
          cls = qxl.apiviewer.dao.Class.getClassByName(classname, true);
        } catch (e) {
          console.error(`APIVIEWER: ${e.message}`);
          continue;
        }
        if (cls.isLoaded()) {
          continue;
        }
        await cls.load();
        if (!cls.isLoaded()) {
          continue;
        }

        let src = cls.getMetaFile();
        let dest = path.relative(qxl.apiviewer.ClassLoader.getBaseUri(), src);
        dest = path.join(outputDir, dest);
        await qx.tool.utils.files.Utils.copyFile(src, dest);

        if (this.__verbose) {
          console.log(`APIVIEWER: analyse ${cls.getName()}`);
        }
        res.classes.push(cls.getName());

        let nameIdx = res.apiindex.fullNames.indexOf(cls.getName());
        if (nameIdx < 0) {
          nameIdx = res.apiindex.fullNames.push(cls.getName()) - 1;
        }

        let typeIdx = TYPES[cls.getType()];
        addToIndex(cls.getName(), typeIdx, nameIdx);

        typeIdx = 2;
        addToIndex(cls.getPackageName(), typeIdx, nameIdx);

        const addMethodToIndex = method => {
          let typeIdx;
          if (method.isProtected()) typeIdx = 4;
          else if (method.isPrivate()) typeIdx = 7;
          else typeIdx = 3;
          addToIndex("#" + method.getName(), typeIdx, nameIdx);
        };
        cls.getStatics().forEach(addMethodToIndex);
        cls.getMethods().forEach(addMethodToIndex);
        cls.getProperties().forEach(prop => {
          let typeIdx = 6;
          addToIndex("#" + prop.getName(), typeIdx, nameIdx);
        });
        cls.getConstants().forEach(con => {
          let typeIdx = 9;
          addToIndex("#" + con.getName(), typeIdx, nameIdx);
        });
        cls.getEvents().forEach(evt => {
          let typeIdx = 5;
          addToIndex("#" + evt.getName(), typeIdx, nameIdx);
        });
        cls.getChildControls().forEach(ch => {
          let typeIdx = 10;
          addToIndex("#" + ch.getName(), typeIdx, nameIdx);
        });
      }

      if (this.__verbose) {
        console.log(`APIVIEWER: analysing done`);
      }

      for (let namespace in metaDb.getDatabase().libraries) {
        let libData = metaDb.getDatabase().libraries[namespace];
        const src = libData.sourceDir;
        const dest = outputDir;
        this.walkSync(src, file => {
          if (path.basename(file) != "__init__.js") {
            return;
          }

          let d = path.join(dest, path.dirname(path.relative(src, file)));
          if (!fs.existsSync(d)) {
            return;
          }

          d = path.join(d, "package.html");
          var meta = fs.readFileSync(file, {
            encoding: "utf8"
          });
          meta = meta.replace(/^\s*\/\*/gm, "");
          meta = meta.replace(/^\s*\*\//gm, "");
          meta = qx.tool.compiler.jsdoc.Parser.parseComment(meta);
          if (meta && Array.isArray(meta["@description"]) && meta["@description"].length) {
            meta = meta["@description"][0].body;
            fs.writeFileSync(d, meta, {
              encoding: "utf8"
            });
          }
        });
      }
      res.classes.sort();

      console.log("Writing output to " + outputDir + "/apiviewer.json");
      await fs.promises.writeFile(outputDir + "/apiviewer.json", JSON.stringify(res, null, 2));
    },

    /**
     * Walks a directory recursively, calling a callback for each file found
     *
     * @param {String} currentDirPath
     * @param {Function} callback
     */
    walkSync(currentDirPath, callback) {
      fs.readdirSync(currentDirPath).forEach(name => {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
          callback(filePath, stat);
        } else if (stat.isDirectory()) {
          this.walkSync(filePath, callback);
        }
      });
    },

    /**
     * Calculates the list of classes to be included in the API viewer
     *
     * @param {qx.tool.compiler.MetaDatabase} metaDb
     * @returns
     */
    getRequiredClasses(metaDb) {
      let result = {};
      metaDb.getClassnames().forEach(classname => (result[classname] = true));

      let includes = [];
      let includeToAPIViewer =
        qx.core.Environment.get("qxl.apiviewer.include") || qx.core.Environment.get("includeToAPIViewer");
      if (qx.core.Environment.get("includeFromAPIViewer")) {
        console.error(`includeFromAPIViewer is deprecated, use qxl.apiviewer.include instead`);
      }
      if (includeToAPIViewer) {
        includes = this.expandClassnames(includeToAPIViewer, result);
      }

      let excludeFromAPIViewer =
        qx.core.Environment.get("qxl.apiviewer.exclude") || qx.core.Environment.get("excludeFromAPIViewer");
      if (qx.core.Environment.get("excludeFromAPIViewer")) {
        console.error(`excludeFromAPIViewer is deprecated, use qxl.apiviewer.exclude instead`);
      }
      if (excludeFromAPIViewer) {
        this.expandClassnames(excludeFromAPIViewer, result).forEach(name => {
          if (!includes.includes(name)) {
            delete result[name];
          }
        });
      }
      return Object.keys(result);
    },

    /**
     * Expands a list of class names including wildcards (eg "qx.ui.*") into an
     * exhaustive list without wildcards
     *
     * @param {String[]} names wildcard names to expand
     * @param {Object<String,Boolean>} classInfo classes
     * @returns
     */
    expandClassnames(names, classInfo) {
      if (!names) {
        return [];
      }
      let result = {};
      names.forEach(function (name) {
        let pos = name.indexOf("*");
        if (pos < 0) {
          result[name] = true;
        } else {
          let prefix = name.substring(0, pos);
          for (let classname of Object.getOwnPropertyNames(classInfo)) {
            if (classname.startsWith(prefix)) result[classname] = true;
          }
        }
      });
      return Object.keys(result);
    }
  }
});
