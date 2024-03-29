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
qx.Class.define("qxl.apiviewer.LoadingIndicator", {
  type: "singleton",
  extend: qx.core.Object,

  construct() {
    this.__blocker = new qx.ui.core.Blocker(
      qxl.apiviewer.MWidgetRegistry.getWidgetById("tabView")
    );
    this.__blocker.setColor("#D5D5D5");
    this.__blocker.setOpacity(0.5);

    /*
    this.__blocker.getBlockerElement().setStyle("padding-top", "100px");
    this.__blocker.getBlockerElement().setStyle("padding-left", "10px");
    this.__blocker.getBlockerElement().setStyle("text-align", "center");
    var loadingImage = new qx.html.Element("img");
    loadingImage.setAttribute("src", qx.util.ResourceManager.getInstance().toUri("qxl/apiviewer/image/loading66.gif"));
    this.__blocker.getBlockerElement().add(loadingImage);
    */
  },

  members: {
    __blocker: null,
    show() {
      this.__blocker.block();
    },
    hide() {
      this.__blocker.unblock();
    },
  },
});
