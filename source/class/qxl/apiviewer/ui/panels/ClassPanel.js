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

qx.Class.define("qxl.apiviewer.ui.panels.ClassPanel", {
  extend: qxl.apiviewer.ui.panels.InfoPanel,

  /**
   * Creates class panel. An class panel shows information about classes, mixins
   * and interfaces
   *
   * @param labelText {String} the label text describing the node type.
   */
  construct(labelText) {
    super(labelText);
  },

  properties: {
    type: {
      init: "class",
      check: ["class", "mixin", "interface"],
    },
  },

  members: {
    /**
     * @Override
     */
    canDisplayItem(dao) {
      if (!(dao instanceof qxl.apiviewer.dao.Class)) {
        return false;
      }
      return dao.getType() == this.getType();
    },

    getItemTypeHtml(node) {
      return qxl.apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
        node.getName(),
        node,
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
        node,
        showDetails
      );
    },

    getItemTooltip(classNode, currentClassDocNode) {
      var tooltip;
      if (classNode.isAbstract()) {
        tooltip = "Abstract ";
      } else if (classNode.isStatic()) {
        tooltip = "Static ";
      } else if (classNode.isSingleton()) {
        tooltip = "Singleton ";
      } else {
        tooltip = "";
      }
      switch (classNode.getType()) {
        case "mixin":
          tooltip += "Mixin";
          break;

        case "interface":
          tooltip += "Interface";
          break;

        default:
          tooltip += "Class";
          break;
      }

      return tooltip;
    },

    itemHasDetails(node, currentClassDocNode) {
      return qxl.apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node);
    },

    /**
     * Updates an info panel.
     *
     * @param classViewer {qxl.apiviewer.ui.ClassViewer} parent class viewer widget.
     * @param currentClassDocNode {qxl.apiviewer.dao.Class} the currently displayed class
     * @return {qx.Promise}
     */
    update(classViewer, currentClassDocNode) {
      if (!this.getElement()) {
        return qx.Promise.resolve(true);
      }

      return this.setDocNodeAsync(currentClassDocNode)
        .then(() => currentClassDocNode.loadDependedClasses())
        .then((classes) => {
          var nodeArr = [];
          var clType;
          for (var i = 0; i < classes.length; i++) {
            clType = classes[i].getType();

            // Normalize pseudo-classes (for the user this detail is often not relevant)
            if (clType === "bootstrap" || clType === "list") {
              clType = "class";
            }

            if (clType === this.getType()) {
              nodeArr.push(classes[i]);
            }
          }

          if (nodeArr && nodeArr.length > 0) {
            classViewer.sortItems(nodeArr);
          }

          this._displayNodes(nodeArr, currentClassDocNode);
        });
    },
  },
});
