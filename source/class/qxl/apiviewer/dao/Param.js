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
 * Represents a parameter or return type, taken from JSDoc meta data
 *
 * Example data:
 *      qooxdoo style
        "@param": [
          {
            "name": "@param",
            "body": "options {Map?null} Optional layout data for widget.",
            "paramName": "options",
            "description": " Optional layout data for widget.",
            "optional": true,
            "defaultValue": "null",
            "type": "Map"
          }
        ],
        jsdoc style
        "@param": [
          {
            "name": "@param",
            "body": "{Map?null} options Optional layout data for widget.",
            "paramName": "options",
            "description": " Optional layout data for widget.",
            "optional": true,
            "defaultValue": "null",
            "type": "Map"
          }
        ],
        "@return": [
          {
            "name": "@return",
            "body": "{Integer} The index position or <code>-1</code> when\nthe given widget is no child of this layout.",
            "docComment": "",
            "type": "Integer",
            "desc": " The index position or <code>-1</code> when\nthe given widget is no child of this layout."
          }
        ]
 */
qx.Class.define("qxl.apiviewer.dao.Param", {
  extend: qx.core.Object,

  construct(meta, method) {
    this.base(arguments);
    this._meta = meta;
    this._method = method;
    this._types = [{ type: "var" }];
    if (meta.type) {
      this._types = qx.lang.Array.toNativeArray(meta.type).map((type) => {
        if (typeof type === "object") {
          return { type: type.type, arrayDimensions: type.dimensions };
        }
        var m = type.match(/^([^[]+)((\[\])+)?$/);
        if (m && m[2]) {
          return { type: m[1], arrayDimensions: m[2].length / 2 };
        }
        return { type: type };
      });
    }
  },

  members: {
    _method: null,
    _meta: null,
    _types: null,
    _arrayDimensions: 0,

    getMethod() {
      return this._method;
    },

    getClass() {
      return this._method.getClass();
    },

    getName() {
      return this._meta.paramName;
    },

    getTypes() {
      return this._types;
    },

    getArrayDimensions() {
      return this._arrayDimensions;
    },

    getDefaultValue() {
      return this._meta.defaultValue;
    },

    isOptional() {
      return Boolean(this._meta.optional);
    },
    getDescription() {
      return this._meta.description || this._meta.body;
    },
  },
});
