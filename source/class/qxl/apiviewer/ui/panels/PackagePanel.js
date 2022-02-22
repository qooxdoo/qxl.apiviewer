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

qx.Class.define("qxl.apiviewer.ui.panels.PackagePanel", {
  extend: qxl.apiviewer.ui.panels.InfoPanel,

  members: {
    /**
     * @Override
     */
    canDisplayItem(dao) {
      return dao instanceof qxl.apiviewer.dao.Package;
    },

    getPanelItemObjects(daoClass, showInherited) {
      return daoClass.getPackages();
    },

    getItemTypeHtml(node) {
      return qxl.apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
        node.getFullName(),
        null,
        false,
        true
      );
    },

    getItemTitleHtml(node) {
      return node.getFullName();
    },

    getItemTextHtml(node, getDocNode, showDetails) {
      if (showDetails) {
        return qxl.apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(
          node.getDescription(),
          node
        );
      }
      return qxl.apiviewer.ui.panels.InfoPanel.createDescriptionHtml(
        node,
        node.getPackage(),
        showDetails
      );
    },

    getItemTooltip(classNode, currentClassDocNode) {
      return "Package";
    },

    itemHasDetails(node, currentClassDocNode) {
      return qxl.apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node);
    },

    /**
     * Updates an info panel.
     *
     * @param classViewer {qxl.apiviewer.ui.ClassViewer} parent class viewer widget.
     * @param currentClassDocNode {qxl.apiviewer.dao.Class} the currently displayed class
     */
    update(classViewer, currentClassDocNode) {
      if (!this.getElement()) {
        return qx.Promise.resolve(false);
      }

      return this.setDocNodeAsync(currentClassDocNode).then(() => {
        var nodeArr = currentClassDocNode.getPackages();

        if (nodeArr && nodeArr.length > 0) {
          classViewer.sortItems(nodeArr);
        }

        this._displayNodes(nodeArr, currentClassDocNode);
      });
    },
  },
});
