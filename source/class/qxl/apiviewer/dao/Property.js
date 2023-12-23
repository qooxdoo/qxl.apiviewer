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
 * Represents a property
 *
    "paddingTop": {
      "location": {
        "start": {
          "line": 393,
          "column": 4
        },
        "end": {
          "line": 399,
          "column": 5
        }
      },
      "jsdoc": {
        "@description": [
          {
            "name": "@description",
            "body": "---------------------------------------------------------------------------\nPADDING\n---------------------------------------------------------------------------"
          },
          {
            "name": "@description",
            "body": "Padding of the widget (top)"
          }
        ]
      },
      "name": "paddingTop",
      "propertyType": "new",
      "themeable": true,
      "apply": "_applyPadding",
      "check": "Integer",
      "defaultValue": 0
    },

 */
qx.Class.define("qxl.apiviewer.dao.Property", {
  extend: qxl.apiviewer.dao.ClassItem,

  construct(meta, clazz, name) {
    this.base(arguments, meta, clazz, name);
  },

  members: {
    getTypes() {
      var result = [];
      if (this._meta.check) {
        result.push({ type: this._meta.check });
      }
      return result;
    },

    /**
     * Returns the check attribute of the property definition if
     * the check attribute does not define an internal type or a
     * class. In this case use {@link #getTypes}.
     *
     * @return {String} the contents of the check attribute.
     */
    getCheck() {
      var check = this._meta.check;
      if (
        check &&
        !qxl.apiviewer.dao.Class.getClassByName(check) &&
        !qxl.apiviewer.Constants.PRIMITIVES[check]
      ) {
        return check;
      }

      return null;
    },

    /**
     * @Override
     */
    isRequiredByInterface(iface) {
      return iface
        .getProperties()
        .some((method) => method.getName() == this.getName());
    },

    getClassname() {
      return this._class.getName();
    },

    getPossibleValues() {
      return this._meta.possibleValues || [];
    },

    getGroup() {
      return this._meta.group || [];
    },

    isPropertyGroup() {
      return Boolean(this._meta.group);
    },

    getType() {
      return this.getCheck();
    },

    getEvent() {
      return this._meta.event;
    },

    getApplyMethod() {
      return this._meta.apply;
    },

    isNullable() {
      return Boolean(this._meta.nullable);
    },

    getDefaultValue() {
      return this._meta.defaultValue;
    },

    isInheritable() {
      return this._meta.inheritable || false;
    },

    isThemeable() {
      return this._meta.themeable || false;
    },

    isRefined() {
      return this._meta.refine || false;
    },
  },
});
