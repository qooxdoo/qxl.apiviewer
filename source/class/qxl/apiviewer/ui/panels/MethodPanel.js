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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * John Spackman (johnspackman) of Zenesis Ltd (http://www.zenesis.com)

************************************************************************ */

qx.Class.define("qxl.apiviewer.ui.panels.MethodPanel", {
  extend: qxl.apiviewer.ui.panels.AbstractMethodPanel,

  construct() {
    super("Members", "qxl/apiviewer/image/method_public18.gif");
  },

  members: {
    /**
     * @Override
     */
    canDisplayItem(dao) {
      return dao instanceof qxl.apiviewer.dao.Method && !dao.isStatic() || dao instanceof qxl.apiviewer.dao.PropertyMethod;
    },
  },
});
