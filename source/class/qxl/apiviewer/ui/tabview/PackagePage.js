/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de
     2018 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)
     * John Spackman (johnspackman) of Zenesis Ltd (http://www.zenesis.com)

************************************************************************ */

/**
 * Implements the dynamic behavior of the API viewer.
 * The GUI is defined in {@link Viewer}.
 */
qx.Class.define("qxl.apiviewer.ui.tabview.PackagePage", {
  extend: qxl.apiviewer.ui.tabview.AbstractPage,

  members: {
    _createViewer() {
      return new qxl.apiviewer.ui.PackageViewer();
    },
  },
});
