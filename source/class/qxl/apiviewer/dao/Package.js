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

  construct: function(packageName) {
    this.base(arguments);
    this._packageName = packageName;
    this._classes = {};
    this._packages = {};
    if (packageName) {
      this._parentPackage = qxl.apiviewer.dao.Package.getParentPackage(packageName);
      this._parentPackage.addPackage(this);
    }
  },

  members: {
    _packageName: null,
    _parentPackage: null,
    _classes: null,
    _packages: null,

    getName: function() {
      return this._packageName;
    },

    getFullName: function() {
      return this._packageName;
    },

    getDescription: function() {
      return this._desc || "";
    },

    getClasses: function() {
      return Object.values(this._classes);
    },

    getPackages: function() {
      return Object.values(this._packages);
    },

    getPackage: function() {
      return this._parentPackage;
    },

    addClass: function(clazz) {
      this._classes[clazz.getFullName()] = clazz;
    },
    
    getClassByName: function(name) {
      return this._classes[name];
    },

    getPackageByName: function(name) {
      return this._packages[name];
    },

    addPackage: function(pkg) {
      this._packages[pkg.getFullName()] = pkg;
    },
    
    loadDependedClasses: function() {
      return qxl.apiviewer.ClassLoader.loadClassList(this.getClasses());
    },
    
    hasWarning: function() {
      return false;
    }

  },
  
  statics: {
    __rootPackage: null,
    
    /**
     * Locates a package by name
     * 
     * @param name {String} package name, null or "" for top level
     * @return {Package?}
     */
    getPackage: function(name, create) {
      var root = qxl.apiviewer.dao.Package.__rootPackage;
      if (!root) {
        root = qxl.apiviewer.dao.Package.__rootPackage = new qxl.apiviewer.dao.Package("");
      }
      if (!name) {
        return root;
      }
      
      var current = root;
      var segs = name.split('.');
      
      var parentName = "";
      for (var i = 0; i < segs.length; i++) {
        var tmp = current.getPackageByName(parentName + segs[i]);
        if (!tmp) {
          if (!create)
            return null;
          tmp = new qxl.apiviewer.dao.Package(i == 0 ? segs[i] : current.getFullName() + "." + segs[i]);
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
    getParentPackage: function(name) {
      if (!name)
        throw new Error("Cannot get the parent package of a root package");
      var pos = name.lastIndexOf('.');
      if (pos < 0) {
        return qxl.apiviewer.dao.Package.__rootPackage;
      }
      var parentName = name.substring(0, pos);
      return qxl.apiviewer.dao.Package.getPackage(parentName, true);
    }
  }
});
