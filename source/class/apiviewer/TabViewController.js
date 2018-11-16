/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Implements the dynamic behavior of the API viewer.
 * The GUI is defined in {@link Viewer}.
 */
qx.Class.define("apiviewer.TabViewController",
{
  extend : qx.core.Object,

  construct : function(widgetRegistry)
  {
    this.base(arguments);

    apiviewer.TabViewController.instance = this;

    this._tabView = widgetRegistry.getWidgetById("tabView");
    this._tabView.addListener("changeSelection", this.__onChangeSelection, this);
  },


  events :
  {
    /** This event if dispatched if one of the internal links is tapped */
    "classLinkTapped" : "qx.event.type.Data",

    "changeSelection" : "qx.event.type.Data"
  },


  members :
  {
    showTabView : function() {
      this._tabView.show();
    },

    /**
     * Callback for internal links to other classes/items.
     * This code is called directly from the generated HTML of the
     * class viewer.
     */
    onSelectItem : function(itemName) {
      this.fireDataEvent("classLinkTapped", itemName);
    },

    showItem : function(itemName) {
      qx.ui.core.queue.Manager.flush();

      var page = this._tabView.getSelection()[0];
      page.setUserData("itemName", itemName);

      return page.getChildren()[0].showItem(itemName);
    },

    openPackage : function(classNode, newTab)
    {
      return this.__open(classNode, apiviewer.ui.tabview.PackagePage, newTab);
    },

    openClass : function(classNode, newTab) {
      return this.__open(classNode, apiviewer.ui.tabview.ClassPage, newTab);
    },

    __open : function(classNode, clazz, newTab)
    {
      var currentPage = this._tabView.getSelection()[0] || null;
      
      if (currentPage && (!(currentPage instanceof clazz) || newTab)) {
        this._tabView.remove(currentPage);
        currentPage.destroy();
        currentPage = null;
      }

      if (!currentPage) {
        currentPage = new clazz(classNode);
        this._tabView.add(currentPage);
      }
      
      this._tabView.setSelection([currentPage]);
      
      currentPage.setUserData("itemName", null);
      return currentPage.setClassNodeAsync(classNode)
        .then(() => apiviewer.LoadingIndicator.getInstance().hide());
    },

    __onChangeSelection : function(event)
    {
      var oldData = event.getOldData();
      var data = event.getData();
      this.fireDataEvent("changeSelection", data, oldData);
    }
  },

  destruct : function()
  {
    this._tabView.destroy();
    this._tabView = null;
  }
});
