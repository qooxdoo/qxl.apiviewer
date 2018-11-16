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
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("apiviewer.dao.ChildControl", {
  extend : qx.core.Object,

  construct : function(meta) {
    this.base(arguments);
    this._meta = meta;
  },

  members : {

    getName: function() {
      return this._meta.paramName;
    },
    
    getDescription: function() {
      return this._meta.desc;
    },
    
    getType: function() {
      return this._type;
    },

    getTypes : function() {
      var result = [];
      if (this._meta.type) {
        result.push({
          type : this._meta.type
        });
      }
      return result;
    }
  }

});
