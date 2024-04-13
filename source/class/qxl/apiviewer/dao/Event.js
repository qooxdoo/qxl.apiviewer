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

qx.Class.define("qxl.apiviewer.dao.Event", {
  extend: qxl.apiviewer.dao.ClassItem,

  construct(meta, clazz, name) {
    this.base(arguments, meta, clazz, name);
    this._type = meta.type;
  },

  members: {
    getType() {
      return qxl.apiviewer.dao.Class.getClassByName(this._type);
    },

    getTypes() {
      if (this._type) {
        return [
          {
            type: this._type,
          },
        ];
      }
      return [];
    },

    /**
     * @Override
     */
    isRequiredByInterface(iface) {
      return iface
        .getEvents()
        .some((method) => method.getName() == this.getName());
    },
  },
});
