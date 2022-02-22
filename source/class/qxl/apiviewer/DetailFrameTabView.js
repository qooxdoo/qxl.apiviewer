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
qx.Class.define("qxl.apiviewer.DetailFrameTabView", {
  extend: qx.ui.tabview.TabView,

  /*
  *****************************************************************************
   MEMBERS
  *****************************************************************************
  */

  members: {
    add(page) {
      super.add(page);
      if (this.getChildren().length == 1) {
        this.getChildren()[0].setShowCloseButton(false);
      } else {
        for (var i = 0, l = this.getChildren().length; i < l; i++) {
          this.getChildren()[i].setShowCloseButton(true);
        }
      }
    },
    remove(page) {
      if (this.getChildren().length > 1) {
        super.remove(page);
        if (this.getChildren().length == 1) {
          this.getChildren()[0].setShowCloseButton(false);
        }
      }
    },
  },
});
