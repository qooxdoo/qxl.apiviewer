/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * Fabian Jakobs (fjakobs)

 ************************************************************************ */

/**
 * Module for on demand class data loading.
 */
qx.Class.define("apiviewer.ClassLoader", {
  extend: qx.core.Object,

  statics: {
    __baseUri: null,
    
    setBaseUri: function(baseUri) {
      this.__baseUri = baseUri;
    },
    
    getBaseUri: function() {
      return this.__baseUri;
    },
    
    loadClassList: function(classes, callback, self) {
      if (!classes.length) {
        callback && callback.call(self||this, []);
        return new qx.Promise.resolve([]);
      }
      
      var all = classes.map(clazz => clazz.load());
      return qx.Promise.all(all)
        .then(() => callback && callback.call(self||this, classes))
        .then(() => classes);
    },
    
    getClassOrPackage: function(name) {
      if (name) {
        var cls = apiviewer.dao.Class.getClassByName(name);
        if (cls)
          return cls;
      }
      var pkg = apiviewer.dao.Package.getPackage(name);
      return pkg;
    }
  }

});
