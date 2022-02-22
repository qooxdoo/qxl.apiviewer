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
 * This Class wraps the access to the documentation data of a class item.
 */
qx.Class.define("qxl.apiviewer.dao.ClassItem", {
  extend: qxl.apiviewer.dao.Node,

  /**
   * @param meta
   * @param parentClass {qxl.apiviewer.dao.Class} reference to the class this item belongs to
   * @param name {String} name of the list in the JSON structure of the class
   */
  construct(meta, parentClass, name) {
    this.base(arguments, meta);
    this._class = parentClass;
    this._name = name;
  },

  members: {
    _class: null,
    _name: null,

    /**
     * Get the class, this item belongs to
     *
     * @return {qxl.apiviewer.dao.Class} the class this item belongs to
     */
    getClass() {
      return this._class;
    },

    /**
     * Get the name of the item.
     *
     * @return {String} name of the item
     */
    getName() {
      return this._name;
    },

    getFullName() {
      return this.getClass().getFullName() + "#" + this._name;
    },

    /**
     * Get the types of the item.
     *
     * @return {Map[]} Array of types of the item. A type has the keys 'type' and 'dimensions', where
     * dimensions is the number of array dimensions (eg "Integer[][]" has a type of "Integer" and
     * dimensions of 2, and "Integer" has type if "Integer" but dimensions is undefined
     */
    getTypes() {
      var result = [];
      var arr = this._jsdoc["@param"];
      if (arr) {
        arr.map((item) => {
          var result = {
            type: item.type,
          };

          if (result.type) {
            var dims = result.type.match(/\[\]/g);
            if (dims) {
              result.dimensions = dims.length;
            }
          }
          return result;
        });
      }
      return result;
    },

    /**
     * Get all references declared using the "see" attribute.
     *
     * @return {String[]} A list of all references declared using the "see" attribute.
     */
    getSee() {
      return (this._jsdoc["@see"] || []).map((item) => item.body);
    },

    /**
     * If the item is overwridden from one of the super classes, get the item, which is overwridden.
     *
     * @return {ClassItem} the overwridden class item
     */
    getOverriddenFrom() {
      return this._meta.overriddenFrom
        ? qxl.apiviewer.dao.Class.getClassByName(this._meta.overriddenFrom)
        : null;
    },

    /**
     * Checks whether the node is required by the given interface.
     *
     * @param ifaceNode {qxl.apiviewer.dao.Class} interface to check for
     * @return {Boolean} whether the item is required by the interface.
     */
    isRequiredByInterface(ifaceNode) {
      throw new Error(
        "No implementation for " + this.classname + ".isRequiredByInterface"
      );
    },

    /**
     * Get the interface this item is required by.
     *
     * @return {qxl.apiviewer.dao.Class} The interface this item is required by.
     */
    getRequiredBy() {
      if (this._requiredBy) {
        return this._requiredBy;
      }

      var requiredBy = [];
      var interfaces = this.getClass().getAllInterfaces(true);

      for (var j = 0; j < interfaces.length; j++) {
        if (this.isRequiredByInterface(interfaces[j])) {
          requiredBy.push(interfaces[j]);
        }
      }
      this._requiredBy = requiredBy;
      return requiredBy;
    },
  },

  /*
  *****************************************************************************
    DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this._class =
      this._itemDocNode =
      this._requiredBy =
      this._see =
      this._types =
        null;
  },
});
