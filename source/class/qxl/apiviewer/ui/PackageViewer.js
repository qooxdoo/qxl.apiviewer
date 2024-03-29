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
     * Jonathan Weiß (jonathan_rass)
     * John Spackman (johnspackman)

************************************************************************ */

/**
 * Shows the package details.
 */
qx.Class.define("qxl.apiviewer.ui.PackageViewer", {
  extend: qxl.apiviewer.ui.AbstractViewer,

  /*
  *****************************************************************************
   CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    super();
    this.addInfoPanel(
      new qxl.apiviewer.ui.panels.ClassPanel("class").set({ type: "class" })
    );
    this.addInfoPanel(
      new qxl.apiviewer.ui.panels.ClassPanel("interface").set({
        type: "interface",
      })
    );
    this.addInfoPanel(
      new qxl.apiviewer.ui.panels.ClassPanel("mixin").set({ type: "mixin" })
    );
    this.addInfoPanel(new qxl.apiviewer.ui.panels.PackagePanel("packages"));

    this.getContentElement().setAttribute("class", "ClassViewer");

    this._init(qxl.apiviewer.dao.Package.getPackage(null));
  },

  /*
  *****************************************************************************
   MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Returns the HTML fragment for the title
     *
     * @param classNode {qxl.apiviewer.dao.Package} the package documentation node for the title
     * @return {String} HTML fragment of the title
     */
    _getTitleHtml(classNode) {
      var vHtml = "";

      // Title
      vHtml += "<small>package</small>";
      vHtml += classNode.getFullName();
      return vHtml;
    },

    _getTocHtml(classNode) {
      return document.createTextNode("");
    },

    _getDescriptionHtml(classNode) {
      var descHtml = new qx.util.StringBuilder();
      var desc = classNode.getDescription();
      if (desc != "") {
        descHtml.add(
          '<div class="class-description">',
          qxl.apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(
            desc,
            classNode
          ),
          "</div>"
        );
      }
      return qx.Promise.resolve(descHtml.get());
    },
  },
});
