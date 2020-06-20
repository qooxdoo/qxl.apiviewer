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

/**
 * Module for on demand class data loading.
 */
qx.Class.define("qxl.apiviewer.ClassLoader", {
  extend: qx.core.Object,

  statics: {
    __baseUri: null,
    
    RESOURCEPATH: null,

    setBaseUri: function(baseUri) {
      this.__baseUri = baseUri;
    },

    getBaseUri: function() {
      return this.__baseUri;
    },

    loadClassList: function(classes, callback, self) {
      if (!classes.length) {
        callback && callback.call(self||this, []);
        return qx.Promise.resolve([]);
      }

      var all = classes.map(clazz => clazz.load());
      return qx.Promise.all(all)
        .then(() => callback && callback.call(self||this, classes))
        .then(() => classes);
    },

    getClassOrPackage: function(name) {
      if (name) {
        var cls = qxl.apiviewer.dao.Class.getClassByName(name);
        if (cls) {
          return qxl.apiviewer.dao.Class.isNativeObject(cls) ? null : cls;
        }
      }
      var pkg = qxl.apiviewer.dao.Package.getPackage(name);
      return pkg;
    }
  },
  defer: function(statics) {
    statics.RESOURCEPATH = "apidata";
  }


});
