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

qx.Class.define("qxl.apiviewer.dao.PropertyMethod", {
  extend: qxl.apiviewer.dao.ClassItem,

  /**
   * Constructor for methods generated from properties
   * 
   * @param {*} meta the meta data for the property
   * @param {qxl.apiviewer.dao.Class} clazz 
   * @param {String} name 
   * @param {String} prefix - "get", "set", etc
   */
  construct(meta, clazz, name, prefix) {
    this.base(arguments, meta, clazz, name);

    let type = meta.json.check;
    if (typeof type != "string") {
      type = "any";
    }
    this._params = [];
    if (prefix == "set") {
      this._params = [
        new qxl.apiviewer.dao.Param({
            "name": "@param",
            "body": `value {${type}} The value to set for the property ${name}`,
            "paramName": "value",
            "description": `Sets the ${name} property.`,
            "type": type
          }, this)
      ]
    }
    if (prefix == "get" || prefix == "is") {
      this._return = new qxl.apiviewer.dao.Param({
            "name": "@return",
            "body": `{${type}} The value to of the property ${name}`,
            "description": `The ${name} property.`,
            "type": type
          }, this)
    }
    this._throws = [];
    this._applyFor = [];
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

    isAsync() {
      return this._meta.async || false;
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
