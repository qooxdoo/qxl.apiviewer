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

qx.Class.define("apiviewer.ui.panels.PackagePanel",
{
  extend: apiviewer.ui.panels.InfoPanel,

  members :
  {
    /**
     * @Override
     */
    canDisplayItem: function(dao) {
      return dao instanceof apiviewer.dao.Package; 
    },
    
    getPanelItemObjects: function(daoClass, showInherited) {
      return daoClass.getPackages();
    },
        
    getItemTypeHtml : function(node)
    {
      return apiviewer.ui.panels.InfoPanel.createItemLinkHtml(node.getFullName(), null, false, true);
    },

    getItemTitleHtml : function(node)
    {
      return node.getFullName();
    },


    getItemTextHtml : function(node, getDocNode, showDetails)
    {
      if (showDetails)
      {
        return apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(node.getDescription(), node);
      } else {
        return apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, node.getPackage(), showDetails);
      }
    },


    getItemTooltip : function(classNode, currentClassDocNode)
    {
      return "Package";
    },


    itemHasDetails : function(node, currentClassDocNode)
    {
      return apiviewer.ui.panels.InfoPanel.descriptionHasDetails(node);
    },


    /**
     * Updates an info panel.
     *
     * @param classViewer {apiviewer.ui.ClassViewer} parent class viewer widget.
     * @param currentClassDocNode {apiviewer.dao.Class} the currently displayed class
     */
    update : function(classViewer, currentClassDocNode)
    {
      if (!this.getElement()) {
        return;
      }

      return this.setDocNodeAsync(currentClassDocNode)
        .then(() => {
          var nodeArr = currentClassDocNode.getPackages();

          if (nodeArr && nodeArr.length > 0) {
            classViewer.sortItems(nodeArr);
          }

          this._displayNodes(nodeArr, currentClassDocNode);
        });
    }

  }

});
