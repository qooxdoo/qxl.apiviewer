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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Implements the dynamic behavior of the API viewer. The GUI is defined in
 * {@link Viewer}.
 */
qx.Class.define("apiviewer.Controller",
{
  extend : qx.core.Object,

  /*
   * ****************************************************************************
   * CONSTRUCTOR
   * ****************************************************************************
   */

  /**
   * @param widgetRegistry
   *          {Viewer} the GUI
   */
  construct : function(widgetRegistry)
  {
    this.base(arguments);

    this._widgetRegistry = apiviewer.MWidgetRegistry;

    this._titlePrefix = "API Documentation";
    document.title = this._titlePrefix;

    apiviewer.ClassLoader.setBaseUri("..");

    this._detailLoader = this._widgetRegistry.getWidgetById("detail_loader");
    this._tabViewController = new apiviewer.TabViewController(this._widgetRegistry);
    this.__bindTabViewController();

    this._tree = this._widgetRegistry.getWidgetById("tree");
    this.__bindTree();

    this.__bindToolbar();

    var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
    var btn_included = this._widgetRegistry.getWidgetById("btn_included");

    btn_inherited.addListener("changeValue", this.__syncMenuButton, this);
    btn_included.addListener("changeValue", this.__syncMenuButton, this);


    this._history = qx.bom.History.getInstance();
    this.__bindHistory();

    qx.core.Init.getApplication().getRoot().addListener("pointerdown", function(e) {
      this.__openInNewTab = e.isShiftPressed() || e.isCtrlOrCommandPressed();
    }, this, true);
  },


  members :
  {
    apiindex : {},
    __openInNewTab : false,

    // overridden
    $$logCategory : "application",

    /**
     * Loads the API doc tree from a URL. The URL must point to a JSON encoded
     * doc tree.
     * 
     * @lint ignoreDeprecated(eval,alert)
     * @param url {String} the URL.
     * @async
     */
    load : function(url) {
      var loadStart = new Date();
      apiviewer.RequestUtil.get(url)
        .then(content => {
          var loadEnd = new Date();

          if (qx.core.Environment.get("qx.debug")) {
            this.debug("Time to load data from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");
          }

          var start = new Date();
          var treeData = eval("(" + content + ")");
          var end = new Date();

          if (qx.core.Environment.get("qx.debug")) {
            this.debug("Time to eval tree data: " + (end.getTime() - start.getTime()) + "ms");
          }

          // give the browser a chance to update its UI before doing more
          setTimeout(() => {
            this.__setDocTree(treeData);

            setTimeout(() => {
              // Handle bookmarks
              var state = this._history.getState();
              if (state) {
                this.__selectItem(this.__decodeState(state));
              } else {
                this.__selectItem("");
                // Open the package node if it has child packages
                /*
                if (depth < qx.core.Environment.get("apiviewer.initialTreeDepth") && packageDoc.getPackages().length > 0) {
                  packageTreeNode.setOpen(true);
                }
                */

              }
            });
          });
        })
        .catch(err => {
          this.error("Couldn't load file: " + url);
          if (window.location.protocol == "file:") {
            alert("Failed to load API data from the file system.\n\n" +
                  "The security settings of your browser may prohibit AJAX " +
                  "when using the file protocol. Please try the http protocol " +
                  "instead.");
          }
        });
    },


    /**
     * binds the events of the TabView controller
     */
    __bindTabViewController : function()
    {
      this._tabViewController.addListener("classLinkTapped", function(evt) {
          this._updateHistory(evt.getData());
      }, this);

      this._tabViewController.addListener("changeSelection", function(evt) {
        var page = evt.getData()[0];

        if (this._ignoreTabViewSelection == true) {
          return;
        }

        if (page && page.getUserData("nodeName")) {
          var nodeName = page.getUserData("nodeName");
          var itemName = page.getUserData("itemName");

          if (itemName != null) {
            this._updateHistory(nodeName + "#" + itemName);
          } else {
            this._updateHistory(nodeName);
          }
        } else {
          this._tree.resetSelection();
        }
      }, this);
    },


    /**
     * binds the selection event of the package tree.
     */
    __bindTree : function()
    {
      this._tree.addListener("changeSelection", function(evt) {
        var treeNode = evt.getData()[0];
        if (treeNode && treeNode.getUserData("nodeName") && !this._ignoreTreeSelection)
        {
          var nodeName = treeNode.getUserData("nodeName");

          // the history update will cause _selectClass to be called.
          this._updateHistory(nodeName);
        }
      }, this);
    },


    /**
     * binds the actions of the toolbar buttons.
     */
    __bindToolbar : function()
    {
      var uiModel = apiviewer.UiModel.getInstance();

      var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
      btn_inherited.bind("value", uiModel, "showInherited");
      uiModel.bind("showInherited", btn_inherited, "value");

      var btn_included = this._widgetRegistry.getWidgetById("btn_included");
      btn_included.bind("value", uiModel, "showIncluded");
      uiModel.bind("showIncluded", btn_included, "value");

      var btn_expand = this._widgetRegistry.getWidgetById("btn_expand");
      btn_expand.bind("value", uiModel, "expandProperties");
      uiModel.bind("expandProperties", btn_expand, "value");

      var btn_protected = this._widgetRegistry.getWidgetById("btn_protected");
      btn_protected.bind("value", uiModel, "showProtected");
      uiModel.bind("showProtected", btn_protected, "value");

      var btn_private = this._widgetRegistry.getWidgetById("btn_private");
      btn_private.bind("value", uiModel, "showPrivate");
      uiModel.bind("showPrivate", btn_private, "value");

      var btn_internal = this._widgetRegistry.getWidgetById("btn_internal");
      btn_internal.bind("value", uiModel, "showInternal");
      uiModel.bind("showInternal", btn_internal, "value");
    },


    /**
     * Keeps the icon of the menubutton in sync with the menu checkboxes of
     * inherited and mixin includes.
     * 
     */
    __syncMenuButton : function()
    {
      var menuButton = this._widgetRegistry.getWidgetById("menubtn_includes");
      var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
      var btn_included = this._widgetRegistry.getWidgetById("btn_included");
      var showInherited = btn_inherited.getValue();
      var showMixins = btn_included.getValue();
      if(showMixins && showInherited)
      {
        menuButton.setIcon('apiviewer/image/inherited_and_mixins_included.gif');
      }
      if(showInherited && !showMixins)
      {
        menuButton.setIcon('apiviewer/image/method_public_inherited18.gif');
      }
      if(!showInherited && showMixins)
      {
        menuButton.setIcon('apiviewer/image/overlay_mixin18.gif');
      }
      if(!showInherited && !showMixins)
      {
        menuButton.setIcon('apiviewer/image/includes.gif');
      }

    },

    /**
     * bind history events
     */
    __bindHistory : function()
    {
      this._history.addListener("changeState", function(evt) {
        var item = this.__decodeState(evt.getData());
        if (item) {
          this.__selectItem(item);
        }
      }, this);
    },


    /**
     * Loads the documentation tree.
     * 
     * @param docTree
     *          {apiviewer.dao.Package} root node of the documentation tree
     */
    __setDocTree : function(docTree)
    {
		
      let expandClassnames = function(names) {
        // Expands a list of class names including wildcards (eg "qx.ui.*") into an
        // exhaustive list without wildcards
        if (!names) {
            return [];
        }
        let result = {};
        names.forEach(function(name) {
          let pos = name.indexOf('*');
          if (pos < 0) {
            result[name] = true;
          } else {
            let prefix = name.substring(0, pos);
            for (let classname in docTree.classInfo) {
              if (classname.startsWith(prefix)) 
              result[classname] = true;
            }
          }
        });
        return Object.keys(result);
      }
    
      let getRequiredClasses = function() {
        let result = {};
        for (let classname in docTree.classInfo) {
          result[classname] = true;
        }  
        expandClassnames(qx.core.Environment.get("excludeFromAPIViewer")).forEach((name) => delete result[name]);
        
        // We sort the result so that we can get a consistent ordering for loading classes, otherwise the order in
        //  which the filing system returns the files can cause classes to be loaded in a lightly different sequence;
        //  that would not cause a problem, except that the build is not 100% repeatable.
        return Object.keys(result).sort();
      }
        
      var start = new Date();
      let classes = getRequiredClasses();

      this.apiindex.__fullNames__ = [];
      this.apiindex.__index__ = {};
      this.apiindex.__types__  = ["doctree", "package", "class", "method_pub", "method_prot", "event", "property_pub", "method_priv", "method_intl", "constant", "childControl"];
      const TYPES = {
         "class": 1,
         "mixin": 1,
         "theme" : 1,
         "interface" : 1
      }

      let addToIndex = function(name, typeIdx, nameIdx) {
        if (!this.apiindex.__index__[name]) {
          this.apiindex.__index__[name] = [];
        }
        this.apiindex.__index__[name].push([typeIdx, nameIdx]);
      }.bind(this);

      classes.forEach(async (classname) => {
        let cls = apiviewer.dao.Class.getClassByName(classname, true);
        await cls.load();
        let nameIdx = this.apiindex.__fullNames__.indexOf(cls.getName());
        if (nameIdx < 0) {
          nameIdx = this.apiindex.__fullNames__.push(cls.getName()) - 1;
        }
        let typeIdx = TYPES[cls.getType()];
        addToIndex(cls.getName(), typeIdx, nameIdx);
        typeIdx = 1;
        addToIndex(cls.getPackageName(), typeIdx, nameIdx);
        cls.getMethods().forEach(method => {
           let typeIdx;
           if (method.isProtected())  
              typeIdx = 4;
           else if (method.isPrivate())
              typeIdx = 7;
           else
              typeIdx = 3;
           addToIndex('#' + method.getName(), typeIdx, nameIdx);
        });
        cls.getProperties().forEach(prop => {
          let typeIdx = 6;
          addToIndex('#' + prop.getName(), typeIdx, nameIdx);
       });
       cls.getConstants().forEach(con => {
        let typeIdx = 9;
        addToIndex('#' + con.getName(), typeIdx, nameIdx);
       });
       cls.getEvents().forEach(evt => {
        let typeIdx = 5;
        addToIndex('#' + evt.getName(), typeIdx, nameIdx);
       });
       cls.getChildControls().forEach(ch => {
        let typeIdx = 10;
        addToIndex('#' + ch.getName(), typeIdx, nameIdx);
       });
              

      });
      var rootPackage = apiviewer.dao.Package.getPackage(null);
      var end = new Date();

      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Time to build data tree: " + (end.getTime() - start.getTime()) + "ms");
      }

      var start = new Date();
      this._tree.setTreeData(rootPackage);
      var end = new Date();

      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Time to update tree: " + (end.getTime() - start.getTime()) + "ms");
      }

      return true;
    },


    /**
     * Push the class to the browser history
     * 
     * @param className
     *          {String} name of the class
     */
    _updateHistory : function(className)
    {
      var newTitle = className + " - " + this._titlePrefix;
      qx.bom.History.getInstance().addToHistory(this.__encodeState(className), newTitle);
    },


    /**
     * Display information about a class
     * 
     * @param classNode
     *          {apiviewer.dao.Class} class node to display
     */
    _selectClass : function(classNode, callback, self) {
      this._detailLoader.exclude();
      this._tabViewController.showTabView();

      return classNode.loadDependedClasses()
        .then(() => {
          if (classNode instanceof apiviewer.dao.Class) {
            return this._tabViewController.openClass(classNode, this.__openInNewTab);
          } else {
            return this._tabViewController.openPackage(classNode, this.__openInNewTab);
          }
        })
        .then(() => callback && callback.call(self));
    },


    /**
     * Selects an item (class, property, method or constant).
     * 
     * @param fullItemName
     *          {String} the full name of the item to select. (e.g.
     *          "qx.mypackage.MyClass" or "qx.mypackage.MyClass#myProperty")
     * 
     * @lint ignoreDeprecated(alert)
     */
    __selectItem : function(fullItemName) {
      apiviewer.LoadingIndicator.getInstance().show();
      var className = fullItemName;
      var itemName = null;
      var hashPos = fullItemName.indexOf("#");

      if (hashPos != -1) {
        className = fullItemName.substring(0, hashPos);
        itemName = fullItemName.substring(hashPos + 1);

        var parenPos = itemName.indexOf("(");

        if (parenPos != -1) {
          itemName = itemName.substring(0, parenPos).trim();
        }
      }

      // ignore changeSelection events
      this._ignoreTreeSelection = true;
      this._tree.selectTreeNodeByClassName(className)
        .then(couldSelectTreeNode => {
          this._ignoreTreeSelection = false;

          if (!couldSelectTreeNode) {
            this.error("Unknown class: " + className);
            //alert("Unknown class: " + className);
            apiviewer.LoadingIndicator.getInstance().hide();
            return;
          }

          var sel = this._tree.getSelection();
          var nodeName = sel[0].getUserData("nodeName") || className;

          /**
           * @lint ignoreDeprecated(alert)
           */
          this._ignoreTabViewSelection = true;
          this._selectClass(apiviewer.ClassLoader.getClassOrPackage(nodeName), () => {
            if (itemName) {
              if (!this._tabViewController.showItem(itemName)) {
                this.error("Unknown item of class '"+ className +"': " + itemName);
                //alert("Unknown item of class '"+ className +"': " + itemName);
                apiviewer.LoadingIndicator.getInstance().hide();

                this._updateHistory(className);
                this._ignoreTabViewSelection = false;
                return;
              }
            }
            this._updateHistory(fullItemName);
            this._ignoreTabViewSelection = false;
          });
        });
    },


    __encodeState : function(state) {
      return state.replace(/(.*)#(.*)/g, "$1~$2")
    },

    __decodeState : function(encodedState) {
      return encodedState.replace(/(.*)~(.*)/g, "$1#$2")
    }

  },



  /*
   * ****************************************************************************
   * DESTRUCTOR
   * ****************************************************************************
   */

  destruct : function()
  {
    this._widgetRegistry = null;
    this._disposeObjects("_detailLoader", "_tree", "_history", "_tabViewController");
  }
});
