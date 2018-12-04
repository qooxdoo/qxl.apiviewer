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

/**
 * This class wraps the access to documentation nodes.
 */
qx.Class.define("apiviewer.dao.Node", {
  extend : qx.core.Object,
  
  construct: function(meta) {
    this.base(arguments);
    this._meta = {};
    this._jsdoc = {};
    if (meta !== undefined)
      this._initMeta(meta);
  },

  members :
  {
    _meta: null,
    _jsdoc: null,
    _errors: null,

    _initMeta: function(meta) {
      this._meta = meta;
      this._jsdoc = meta.jsdoc || {};
      this._errors = [];
    },
    
    /**
     * Get description
     * 
     * @return {String} description
     */
    getDescription : function()
    {
      var arr = this._jsdoc["@description"];
      if (arr && arr.length)
        return arr[arr.length - 1].body;
      return "";
    },


    /**
     * Get a list of errors of this item.
     * 
     * @return {Map[]} errors of this item.
     */
    getErrors : function()
    {
      return this._errors;
    },


    /**
     * Get the line number of this item in the source file
     * 
     * @return {Integer|null} line number or <code>null</code> if unknown
     */
    getLineNumber : function()
    {
      return this._meta.location ? this._meta.location.start.line : null;
    },


    /**
     * Get whether the node is deprecated.
     * 
     * @return {Boolean} whether the node is deprecated.
     */
    isDeprecated : function()
    {
      return this._jsdoc["@deprecated"] !== undefined;
    },


    /**
     * Get the text of the deprecation message.
     * 
     * @return {String} the deprecation message.
     */
    getDeprecationText : function()
    {
      return (this.isDeprecated() && this._jsdoc["@deprecated"].body) || "";
    },


    /**
     * Get whether the node is internal.
     * 
     * @return {Boolean} whether the node is internal.
     */
    isInternal : function()
    {
      return this._jsdoc["@internal"] !== undefined;
    },


    /**
     * Get whether the node is private.
     * 
     * @return {Boolean} whether the node is private.
     */
    isPrivate : function()
    {
      return this._meta.access == "private";
    },


    /**
     * Get whether the node is protected.
     * 
     * @return {Boolean} whether the node is protected.
     */
    isProtected : function()
    {
      return this._meta.access == "protected";
    },


    /**
     * Get whether the node is property generated.
     * 
     * @return {Boolean} whether the node is property generated.
     */
    isPropertyGenerated : function()
    {
      return !!this._meta.property;
    },


    /**
     * Get whether the node is public.
     * 
     * @return {Boolean} Whether the node is public.
     */
    isPublic : function()
    {
      return (
        !this.isPrivate() &&
        !this.isProtected() &&
        !this.isInternal()
      );
    },


    /**
     * Get whether the node has a warning.
     * 
     * @return {Boolean} whether the node has a warning.
     */
     hasWarning : function()
     {
       return this._meta.hasWarning || false;
     },


    /**
     * Initialize all internal fields. This method will be called by the
     * constructor before the child nodes are parsed.
     */
    _initializeFields : function() {
      this._errors = [];
    }
  }
});
