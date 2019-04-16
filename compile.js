function compile(data, callback) {
  const fs = require("fs");
  const path = require("path");

  qx.Class.define("qxl.apiviewer.RequestUtil", {
    extend: qx.core.Object,

    statics: {
      get: function (url, opts) {
        return new qx.Promise((resolve, reject) => {
          fs.readFile(url, (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          });
        });
      }
    }
  });

  this.addListener("checkEnvironment", e => new qx.Promise(fullfiled => {
    if (this.argv.verbose) {
      console.log(`start analyse for apiviewer`);
    }
    debugger;
    let lib = this._getMaker().getAnalyser().findLibrary("qxl.apiviewer");
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
    qxl.apiviewer.ClassLoader.setBaseUri(path.join(process.cwd(), data.target.outputPath));

    let env = e.getData().environment;
    let excludeFromAPIViewer = env.excludeFromAPIViewer;
    let classInfo = this._getMaker().getAnalyser().getDatabase().classInfo;

    function expandClassnames(names) {
      // Expands a list of class names including wildcards (eg "qx.ui.*") into an
      // exhaustive list without wildcards
      if (!names) {
        return [];
      }
      let result = {};
      names.forEach(function (name) {
        let pos = name.indexOf('*');
        if (pos < 0) {
          result[name] = true;
        } else {
          let prefix = name.substring(0, pos);
          for (let classname in classInfo) {
            if (classname.startsWith(prefix))
              result[classname] = true;
          }
        }
      });
      return Object.keys(result);
    }

    function getRequiredClasses() {
      let result = {};
      for (let classname in classInfo) {
        result[classname] = true;
      }
      if (excludeFromAPIViewer) {
        expandClassnames(excludeFromAPIViewer).forEach(name => delete result[name]);
      }
      // We sort the result so that we can get a consistent ordering for loading classes, otherwise the order in
      //  which the filing system returns the files can cause classes to be loaded in a lightly different sequence;
      //  that would not cause a problem, except that the build is not 100% repeatable.
      return Object.keys(result).sort();
    }


    env.apiviewer = {};
    env.apiviewer.classes = [];
    env.apiviewer.apiindex = {};
    env.apiviewer.apiindex.__fullNames__ = [];
    env.apiviewer.apiindex.__index__ = {};
    env.apiviewer.apiindex.__types__ = ["doctree", "package", "class", "method_pub", "method_prot", "event", "property_pub", "method_priv", "method_intl", "constant", "childControl"];

    const TYPES = {
      "class": 1,
      "mixin": 1,
      "theme": 1,
      "interface": 1
    }

    function addToIndex(name, typeIdx, nameIdx) {
      if (!env.apiviewer.apiindex.__index__[name]) {
        env.apiviewer.apiindex.__index__[name] = [];
      }
      env.apiviewer.apiindex.__index__[name].push([typeIdx, nameIdx]);
    };

    let classes = getRequiredClasses();
    qx.Promise.map(classes, (classname) => {
      let cls;
      try {
        cls = qxl.apiviewer.dao.Class.getClassByName(classname, true);
      } catch (e) {
        console.error(`${e.message}`);
        return;
      }
      return cls.load().then(() => {
        if (this.argv.verbose) {
          console.log(`analyse ${cls.getName()}`);
        }
        env.apiviewer.classes.push(cls.getName());
        let nameIdx = env.apiviewer.apiindex.__fullNames__.indexOf(cls.getName());
        if (nameIdx < 0) {
          nameIdx = env.apiviewer.apiindex.__fullNames__.push(cls.getName()) - 1;
        }
        let typeIdx = TYPES[cls.getType()];
        addToIndex(cls.getName(), typeIdx, nameIdx);
        typeIdx = 1;
        addToIndex(cls.getPackageName(), typeIdx, nameIdx);
        cls.getMethods().forEach(method => {
          let typeIdx;
          if (method.isProtected())
            typeIdx = 4;
          else if (method.isPrivate())
            typeIdx = 7;
          else
            typeIdx = 3;
          addToIndex('#' + method.getName(), typeIdx, nameIdx);
        });
        cls.getProperties().forEach(prop => {
          let typeIdx = 6;
          addToIndex('#' + prop.getName(), typeIdx, nameIdx);
        });
        cls.getConstants().forEach(con => {
          let typeIdx = 9;
          addToIndex('#' + con.getName(), typeIdx, nameIdx);
        });
        cls.getEvents().forEach(evt => {
          let typeIdx = 5;
          addToIndex('#' + evt.getName(), typeIdx, nameIdx);
        });
        cls.getChildControls().forEach(ch => {
          let typeIdx = 10;
          addToIndex('#' + ch.getName(), typeIdx, nameIdx);
        });
      });
    }).then(() => {
      if (this.argv.verbose) {
        console.log(`analysing done`);
      }
      let libs = this._getMaker().getAnalyser().getLibraries();
      qx.Promise.map(libs, (lib) => {
        const src = path.join(lib.getRootDir(), lib.getSourcePath());
        const dest = path.join(process.cwd(), data.target.outputPath, "transpiled");
        debugger;
        return qx.tool.compiler.files.Utils.sync(src, dest, (from, to) => {
          return path.basename(from) === "__init__.js";
        });
      }).then(() => {
        fullfiled();
      });
    });
  }));
  callback(null, data);
}