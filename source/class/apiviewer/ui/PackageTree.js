/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The package tree.
 */
qx.Class.define("apiviewer.ui.PackageTree",
{
  extend : qx.ui.tree.Tree,


  construct : function()
  {
    this.base(arguments, "Documentation");

    this.setDecorator(null);
    this.setPadding(0);

    this.__root = new qx.ui.tree.TreeFolder("Packages");
    this.__root.setOpen(true);
    this.setRoot(this.__root);
    this.setSelection([this.__root]);

    // TODO: Is this workaround still needed?
    // Workaround: Since navigating in qx.ui.tree.Tree doesn't work, we've to
    // maintain a hash that keeps the tree nodes for class names
    this._classTreeNodeHash = {};
  },


  /*
   * ****************************************************************************
   * MEMBERS
   * ****************************************************************************
   */

  members :
  {

    __root : null,

    /**
     * Updates the tree on the left.
     * 
     * @param docTree
     *          {apiviewer.dao.Package} the documentation tree to use for
     *          updating.
     * @return {void}
     */
    setTreeData : function(docTree)
    {
      this._docTree = docTree;

      // Fill the packages tree
      this.__fillPackageNode(this.__root, docTree, 0);

      if (this._wantedClassName) {
        this.selectTreeNodeByClassName(this._wantedClassName);
        this._wantedClassName = null;
      }
    },


    /**
     * Selects a certain class.
     * 
     * @param className {String} the name of the class to show.
     * @async
     * @return {Boolean} Whether the class name was valid and could be selected.
     */
    selectTreeNodeByClassName : function(className) {
      if (this._docTree == null) {
        // The doc tree has not been loaded yet
        // -> Remember the wanted class and show when loading is done
        this._wantedClassName = className;
        return qx.Promise.resolve(true);
      }
      
      if (!className) {
        this.__root.setOpen(true);
        this.setSelection([this.__root]);
        this.scrollChildIntoView(this.__root);
        return qx.Promise.resolve(true);
      }
      
      var nameParts = className.split(".");
      var name = "";
      var nameIndex = 0;
      
      let next = () => {
        if (nameIndex > 0)
          name += ".";
        name += nameParts[nameIndex];
        var treeNode = this._classTreeNodeHash[name];
        if (!treeNode)
          return null;
        treeNode.setOpen(true);
        return treeNode.loading
          .then(() => {
            nameIndex++;
            if (nameIndex < nameParts.length)
              return next();
            return treeNode;
          });
      }
      
      return next()
        .then(treeNode => {
          if (treeNode) {
            this.setSelection([treeNode]);
            this.scrollChildIntoView(treeNode);
            return true;
          } else {
            this.setSelection([]);
            return false;
          }
        });
    },


    /**
     * Create a callback which loads the child nodes of a tree folder
     * 
     * @param packageTreeNode
     *          {qx.ui.tree.TreeFolder} the package tree folder.
     * @param packageDoc
     *          {apiviewer.dao.Package} the documentation node of the package.
     * @param depth
     *          {var} current depth in the tree
     * @return {Function} the opener callback function
     */
    __getPackageNodeOpener : function (packageTreeNode, packageDoc, depth) {
      var self = this;
      return function() {
        if (!packageTreeNode.loaded)
        {
          self.__fillPackageNode(packageTreeNode, packageDoc, depth + 1);
          packageTreeNode.setOpenSymbolMode("always");
        }
      }
    },


    /**
     * Fills a package tree node with tree nodes for the sub packages and
     * classes.
     * 
     * @param treeNode
     *          {qx.ui.tree.TreeFolder} the package tree node.
     * @param docNode
     *          {apiviewer.dao.Package} the documentation node of the package.
     * @param depth
     *          {var} current depth in the tree
     */
    __fillPackageNode : function(treeNode, docNode, depth)
    {
      var PackageTree = apiviewer.ui.PackageTree;

      var packagesDoc = docNode.getPackages();
      for (var i=0; i<packagesDoc.length; i++)
      {
        var packageDoc = packagesDoc[i];
        var iconUrl = apiviewer.TreeUtil.getIconUrl(packageDoc);
        var segs = packageDoc.getName().split('.');
        var packageTreeNode = new qx.ui.tree.TreeFolder(segs[segs.length - 1]);
        packageTreeNode.setIcon(iconUrl);
        packageTreeNode.setOpenSymbolMode("always");
        packageTreeNode.setUserData("nodeName", packageDoc.getFullName());
        treeNode.add(packageTreeNode);

        // defer adding of child nodes
        packageTreeNode.addListener("changeOpen", this.__getPackageNodeOpener(packageTreeNode, packageDoc, depth + 1), this);

        // Register the tree node
        this._classTreeNodeHash[packageDoc.getFullName()] = packageTreeNode;
      }

      treeNode.loading = docNode.loadDependedClasses().then(classes => {
        console.log("docNode=" + docNode.classname);
        classes.forEach(classDoc => {
          var iconUrl = apiviewer.TreeUtil.getIconUrl(classDoc);
          var classTreeNode = new qx.ui.tree.TreeFolder(classDoc.getName());
          classTreeNode.setIcon(iconUrl);
          classTreeNode.setUserData("nodeName", classDoc.getFullName());
          classTreeNode.treeType = PackageTree.PACKAGE_TREE;
          treeNode.add(classTreeNode);
          classTreeNode.loading = qx.Promise.resolve();
          classTreeNode.loaded = true;

          // Register the tree node
          this._classTreeNodeHash[classDoc.getFullName()] = classTreeNode;
          treeNode.loaded = true;
        });
        return null;
      });
    }

  },


  /*
   * ****************************************************************************
   * DESTRUCTOR
   * ****************************************************************************
   */

  destruct : function()
  {
    this._docTree = this._classTreeNodeHash = null;
    this._disposeObjects("__root")
  }
});
