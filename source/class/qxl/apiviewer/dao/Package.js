/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2018 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (johnspackman)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxl.apiviewer.dao.Package", {
  extend: qx.core.Object,

  construct(packageName) {
    this.base(arguments);
    this._packageName = packageName;
    this._classes = {};
    this._packages = {};
    if (packageName) {
      this._parentPackage =
        qxl.apiviewer.dao.Package.getParentPackage(packageName);
      this._parentPackage.addPackage(this);
    }
  },

  members: {
    _packageName: null,
    _parentPackage: null,
    _classes: null,
    _packages: null,
    _loadingPromise: null,
    _loaded: false,

    /**
     * Loads the class
     *
     * @return {Promise}
     */
    load() {
      if (this._loadingPromise) {
        return this._loadingPromise;
      }
      var url =
        qxl.apiviewer.ClassLoader.getBaseUri() +
        this._packageName.replace(/\./g, "/") +
        "/package.html";
      return (this._loadingPromise = qxl.apiviewer.RequestUtil.get(url)
        .then((content) => {
          this._desc = content;
          this._loaded = true;
        })
        .catch((e) => {
          this.error("Couldn't load file: " + url + " " + e.message);
          this._loaded = true;
        }));
    },

    isLoaded() {
      return this._loaded;
    },

    getName() {
      return this._packageName;
    },

    getFullName() {
      return this._packageName;
    },

    getDescription() {
      return this._desc || "";
    },

    getClasses() {
      return Object.values(this._classes);
    },

    getPackages() {
      return Object.values(this._packages);
    },

    getPackage() {
      return this._parentPackage;
    },

    addClass(clazz) {
      this._classes[clazz.getFullName()] = clazz;
    },

    getClassByName(name) {
      return this._classes[name];
    },

    getPackageByName(name) {
      return this._packages[name];
    },

    addPackage(pkg) {
      this._packages[pkg.getFullName()] = pkg;
    },

    loadDependedClasses() {
      return qxl.apiviewer.ClassLoader.loadClassList(this.getClasses());
    },

    hasWarning() {
      return false;
    },
  },

  statics: {
    __rootPackage: null,

    /**
     * Locates a package by name
     * @param name {String} package name, null or "" for top level
     * @param create
     * @return {Package?}
     */
    getPackage(name, create) {
      var root = qxl.apiviewer.dao.Package.__rootPackage;
      if (!root) {
        root = qxl.apiviewer.dao.Package.__rootPackage =
          new qxl.apiviewer.dao.Package("");
      }
      if (!name) {
        return root;
      }

      var current = root;
      var segs = name.split(".");

      var parentName = "";
      for (var i = 0; i < segs.length; i++) {
        var tmp = current.getPackageByName(parentName + segs[i]);
        if (!tmp) {
          if (!create) {
            return null;
          }
          tmp = new qxl.apiviewer.dao.Package(
            i == 0 ? segs[i] : current.getFullName() + "." + segs[i]
          );
        }
        current = tmp;
        parentName += segs[i] + ".";
      }

      return current;
    },

    /**
     * Returns the package that a given package or class is a direct child of
     *
     * @param name {String} the name
     * @return {Package} the package
     */
    getParentPackage(name) {
      if (!name) {
        throw new Error("Cannot get the parent package of a root package");
      }
      var pos = name.lastIndexOf(".");
      if (pos < 0) {
        return qxl.apiviewer.dao.Package.getPackage("");
      }
      var parentName = name.substring(0, pos);
      return qxl.apiviewer.dao.Package.getPackage(parentName, true);
    },
  },
});
