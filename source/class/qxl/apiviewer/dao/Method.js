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

qx.Class.define("qxl.apiviewer.dao.Method", {
  extend: qxl.apiviewer.dao.ClassItem,

  construct(meta, clazz, name) {
    this.base(arguments, meta, clazz, name);

    this._params = (this._jsdoc["@params"] || this._jsdoc["@param"] || []).map(
      (item) => new qxl.apiviewer.dao.Param(item, this)
    );
    var arr = this._jsdoc["@return"];
    if (arr && arr.length) {
      this._return = new qxl.apiviewer.dao.Param(arr[0], this);
    }
    arr = this._jsdoc["@throws"];
    this._throws =
      arr && arr.length ? new qxl.apiviewer.dao.Param(arr[0], this) : [];

    if (meta.property) {
      var m = name.match(/^(get|set|is)(.*)$/);
      if (m) {
        this._propertyName = qx.lang.String.firstLow(m[2]);
      }
    }
    this._applyFor = meta.applyFor || [];
  },

  members: {
    _params: null,
    _return: null,
    _throws: null,
    _propertyName: null,
    _applyFor: null,

    isStatic() {
      return this._meta.isStatic || false;
    },

    isAbstract() {
      return this._meta.isAbstract || false;
    },

    isConstructor() {
      return this.getName() == "construct";
    },

    isFromProperty() {
      return Boolean(this._meta.property);
    },

    /**
     * @Override
     */
    isDeprecated() {
      return (
        this.base(arguments)  ||
        (this.getFromProperty() && this.getFromProperty().isDeprecated())
      );
    },

    getParams() {
      return this._params;
    },

    getReturn() {
      return this._return;
    },

    getThrows() {
      return this._throws;
    },

    getFromProperty() {
      return this._propertyName
        ? this.getClass().getProperty(this._propertyName)
        : null;
    },

    getApplyFor() {
      return this._applyFor;
    },

    /**
     * @Override
     */
    isRequiredByInterface(iface) {
      return (iface.getMethods() || []).some(
        (method) => method.getName() == this.getName()
      );
    },
  },
});
