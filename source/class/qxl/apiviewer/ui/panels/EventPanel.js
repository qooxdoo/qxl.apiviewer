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

qx.Class.define("qxl.apiviewer.ui.panels.EventPanel", {
  extend: qxl.apiviewer.ui.panels.InfoPanel,

  construct() {
    super("Events", "qxl/apiviewer/image/event18.gif");
  },

  members: {
    /**
     * @Override
     */
    canDisplayItem(dao) {
      return dao instanceof qxl.apiviewer.dao.Event;
    },

    _canShowInherited() {
      return true;
    },

    getPanelItemObjects(daoClass, showInherited) {
      var arr = daoClass.getEvents();
      if (showInherited) {
        arr = arr.concat(daoClass.getMixinEvents());
      }
      return arr;
    },

    /**
     * Checks whether an event has details.
     *
     * @param node {Map} the doc node of the event.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the event has details.
     */
    itemHasDetails(node, currentClassDocNode) {
      return (
        node.getOverriddenFrom() || // event is inherited
        node.getSee().length > 0 ||
        node.getErrors().length > 0 ||
        qxl.apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node)
      );
    },

    getItemTypeHtml(node) {
      return qxl.apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var");
    },

    getItemTitleHtml(node) {
      return qxl.apiviewer.ui.panels.InfoPanel.setTitleClass(
        node,
        node.getName()
      );
    },

    /**
     * Creates the HTML showing the information about an event.
     *
     * @param node {Map} the doc node of the event.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the event.
     */
    getItemTextHtml(node, currentClassDocNode, showDetails) {
      // Add the description
      var textHtml = new qx.util.StringBuilder(
        qxl.apiviewer.ui.panels.InfoPanel.createDescriptionHtml(
          node,
          node.getClass(),
          showDetails
        )
      );

      if (showDetails) {
        textHtml.add(
          qxl.apiviewer.ui.panels.InfoPanel.createInheritedFromHtml(
            node,
            currentClassDocNode
          )
        );
        textHtml.add(qxl.apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(node));
        textHtml.add(
          qxl.apiviewer.ui.panels.InfoPanel.createErrorHtml(
            node,
            currentClassDocNode
          )
        );
        textHtml.add(
          qxl.apiviewer.ui.panels.InfoPanel.createDeprecationHtml(node, "event")
        );
      }

      return textHtml.get();
    },
  },
});
