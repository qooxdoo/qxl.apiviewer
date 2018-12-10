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

************************************************************************ */

/**
 * A util class for handling the documentation tree.
 *
 * @ignore(qx.app.apiviewer.dao)
 */
qx.Class.define("qx.app.apiviewer.TreeUtil",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Gets the child of a doc node having a certain type.
     *
     * @param docNode {Map} the doc node to get the child of.
     * @param childType {String} the type of the child to get.
     * @return {Map} the wanted child or <code>null</code> if <code>docNode</code>
     *           is <code>null</code> or has no such child.
     */
    getChild : function(docNode, childType)
    {
      if (docNode != null && docNode.children != null)
      {
        for (var i=0; i<docNode.children.length; i++)
        {
          if (docNode.children[i].type == childType) {
            return docNode.children[i];
          }
        }
      }

      return null;
    },


    /**
     * Gets the child of a doc node having a certain attribute value.
     *
     * @param docNode {Map} the doc node to get the child of.
     * @param attributeName {String} the name of the attribute the wanted child must have.
     * @param attributeValue {String} the value of the attribute the wanted child must have.
     * @return {Map} the wanted child or <code>code</code> if there is no such child.
     */
    getChildByAttribute : function(docNode, attributeName, attributeValue)
    {
      if (docNode.children != null)
      {
        for (var i=0; i<docNode.children.length; i++)
        {
          var node = docNode.children[i];

          if (node.attributes && node.attributes[attributeName] == attributeValue) {
            return node;
          }
        }
      }

      return null;
    },


    /**
     * Gets the icon URL of a doc node.
     *
     * @param node {Map} the node to get the icon for.
     * @param inherited {Boolean? false} whether the node was inherited.
     * @return {var} the URL of the icon. May be a string or an array of string
     *           (in case of an overlay icon).
     * @throws {Error} If node is of an unknown type.
     */
    getIconUrl : function(node, inherited)
    {
      var constName;
      var dao = qx.app.apiviewer.dao;

      if (node instanceof dao.Package)
      {
        constName = "ICON_PACKAGE";
      }
      else if (node instanceof dao.Class)
      {
        switch (node.getType())
        {
          case "mixin":
            constName = "ICON_MIXIN";
            break;

          case "interface":
            constName = "ICON_INTERFACE";
            break;

          default:
            constName = "ICON_CLASS";
            if (node.isStatic()) {
              constName += "_STATIC";
            } else if (node.isAbstract()) {
              constName += "_ABSTRACT";
            } else if (node.isSingleton()) {
              constName += "_SINGLETON";
            }
        }
      }
      else if (node instanceof dao.Property)
      {
        constName = "ICON_PROPERTY";
        if (node.isPublic()) {
          constName += "_PUB";
        } else if (node.isProtected()) {
          constName += "_PROT";
        } else if (node.isPrivate()) {
          constName += "_PRIV";
        } else if (node.isInternal()) {
          constName += "_INTERN";
        }
        if (node.isThemeable()) {
          constName += "_THEMEABLE";
        }
      }
      else if (node instanceof dao.Event)
      {
        constName = "ICON_EVENT";
      }
      else if (node instanceof dao.Method)
      {
        if (node.isConstructor()) {
          var constName = "ICON_CTOR";
        } else {
          constName = "ICON_METHOD";
          if (node.isPublic()) {
            constName += "_PUB";
          } else if (node.isProtected()) {
            constName += "_PROT";
          } else if (node.isPrivate()) {
            constName += "_PRIV";
          } else if (node.isInternal()) {
            constName += "_INTERN";
          }
        }

        if (node.isStatic()) {
          constName += "_STATIC";
        } else if (node.isAbstract()) {
          constName += "_ABSTRACT";
        }

        if (node.getClass().getType() == "mixin") {
          constName += "_MIXIN";
        }
      }
      else if (node instanceof dao.Constant)
      {
        constName = "ICON_CONSTANT";
      }
      else if (node instanceof dao.ChildControl)
      {
        constName = "ICON_CHILDCONTROL";
      }
      else
      {
        throw new Error("Unknown node type: " + node.type);
      }

      /*
      if (node.attributes.isMixin) {
        constName += "_MIXIN";
      }
      */

      if (node instanceof dao.ClassItem)
      {
        if (inherited) {
          constName += "_INHERITED";
        } else if (node.getOverriddenFrom && node.getOverriddenFrom()) {
          constName += "_OVERRIDDEN";
        }

        if (node.getErrors().length > 0) {
          constName += "_ERROR";
        }
      }

      if (node.hasWarning()) {
        constName += "_WARN";
      }

      return qx.app.apiviewer.TreeUtil.iconNameToIconPath(constName);
    },


    iconNameToIconPath : function(iconName)
    {
      var iconUrl = qx.app.apiviewer.TreeUtil[iconName];

      if (!iconUrl) {
        var iconParts = iconName.split("_");
        var itemName = iconParts[0] + "_" + iconParts[1];
        if (
          iconParts[2] == "PUB" ||
          iconParts[2] == "PROT" ||
          iconParts[2] == "PRIV" ||
          iconParts[2] == "INTERN"
        ) {
          itemName += "_" +iconParts[2];
          var startIndex = 3;
        } else {
          startIndex = 2;
        }
        iconUrl = [qx.app.apiviewer.TreeUtil[itemName]];
        if (iconUrl[0] == null) {
          throw new Error("Unknown img constant: " + itemName);
        }
        for(var i=startIndex; i<iconParts.length; i++) {
          var iconPart = qx.app.apiviewer.TreeUtil["OVERLAY_" + iconParts[i]];
          if (iconPart == null) {
            throw new Error("Unknown img constant: OVERLAY_" + iconParts[i]);
          }
          iconUrl.push(iconPart);
        }

      }
      return iconUrl;
    },


    /** {string} The URL of the blank icon. */
    ICON_BLANK : "qx/app/apiviewer/image/blank.gif",

    /** {string} The URL of the overlay "abstract". */
    OVERLAY_ABSTRACT : "qx/app/apiviewer/image/overlay_abstract18.gif",

    /** {string} The URL of the overlay "error". */
    OVERLAY_ERROR : "qx/app/apiviewer/image/overlay_error18.gif",

    /** {string} The URL of the overlay "inherited". */
    OVERLAY_INHERITED : "qx/app/apiviewer/image/overlay_inherited18.gif",

    /** {string} The URL of the overlay "overridden". */
    OVERLAY_OVERRIDDEN : "qx/app/apiviewer/image/overlay_overridden18.gif",

    /** {string} The URL of the overlay "themeable". */
    OVERLAY_THEMEABLE : "qx/app/apiviewer/image/overlay_themeable18.gif",

    /** {string} The URL of the overlay "static". */
    OVERLAY_STATIC : "qx/app/apiviewer/image/overlay_static18.gif",

    /** {string} The URL of the overlay "warning". */
    OVERLAY_WARN : "qx/app/apiviewer/image/overlay_warning18.gif",

    /** {string} The URL of the overlay "mixin". */
    OVERLAY_MIXIN : "qx/app/apiviewer/image/overlay_mixin18.gif",

    /** {string} The icon URL of a package. */
    ICON_PACKAGE : "qx/app/apiviewer/image/package18.gif",

    /** {string} The icon URL of a package with warning. */
    ICON_PACKAGE_WARN : "qx/app/apiviewer/image/package_warning18.gif",

    /** {string} The icon URL of a class. */
    ICON_CLASS : "qx/app/apiviewer/image/class18.gif",

    /** {string} The icon URL of a class with warning. */
    ICON_CLASS_WARN : "qx/app/apiviewer/image/class_warning18.gif",

    /** {string} The icon URL of a class with error. */
    ICON_CLASS_ERROR : "qx/app/apiviewer/image/class_warning18.gif",

    /** {string} The icon URL of a static class. */
    ICON_CLASS_STATIC : "qx/app/apiviewer/image/class_static18.gif",

    /** {string} The icon URL of a static class with warning. */
    ICON_CLASS_STATIC_WARN : "qx/app/apiviewer/image/class_static_warning18.gif",

    /** {string} The icon URL of a static class with error. */
    ICON_CLASS_STATIC_ERROR : "qx/app/apiviewer/image/class_static_warning18.gif",

    /** {string} The icon URL of an abstract class. */
    ICON_CLASS_ABSTRACT : "qx/app/apiviewer/image/class_abstract18.gif",

    /** {string} The icon URL of an abstract class with warning. */
    ICON_CLASS_ABSTRACT_WARN : "qx/app/apiviewer/image/class_abstract_warning18.gif",

    /** {string} The icon URL of an abstract class with error. */
    ICON_CLASS_ABSTRACT_ERROR : "qx/app/apiviewer/image/class_abstract_warning18.gif",

    /** {string} The icon URL of an singleton class. */
    ICON_CLASS_SINGLETON : "qx/app/apiviewer/image/class_singleton18.gif",

    /** {string} The icon URL of an singleton class with warning. */
    ICON_CLASS_SINGLETON_WARN : "qx/app/apiviewer/image/class_singleton_warning18.gif",

    /** {string} The icon URL of an singleton class with error. */
    ICON_CLASS_SINGLETON_ERROR : "qx/app/apiviewer/image/class_singleton_warning18.gif",

    /** {string} The icon URL of a property. */
    ICON_PROPERTY_PUB : "qx/app/apiviewer/image/property18.gif",

    /** {string} The icon URL of a protected property. */
    ICON_PROPERTY_PROT : "qx/app/apiviewer/image/property_protected18.gif",

    /** {string} The icon URL of a private property. */
    ICON_PROPERTY_PRIV : "qx/app/apiviewer/image/property_private18.gif",

    /** {string} The icon URL of a internal property. */
    ICON_PROPERTY_INTERN : "qx/app/apiviewer/image/property_internal18.gif",

    /** {string} The icon URL of a themeable property. */
    ICON_PROPERTY_PUB_THEMEABLE : "qx/app/apiviewer/image/property_themeable18.gif",

    /** {string} The icon URL of an event. */
    ICON_EVENT : "qx/app/apiviewer/image/event18.gif",

    /** {string} The icon URL of an entry. Entry is a group property */
    ICON_ENTRY : "qx/app/apiviewer/image/property18.gif",

    /** {string} The icon URL of an interface. */
    ICON_INTERFACE : "qx/app/apiviewer/image/interface18.gif",

    /** {string} The icon URL of an interface. */
    ICON_INTERFACE_WARN : "qx/app/apiviewer/image/interface_warning18.gif",

    /** {string} The icon URL of an mixin. */
    ICON_MIXIN : "qx/app/apiviewer/image/mixin18.gif",

    /** {string} The icon URL of an mixin. */
    ICON_MIXIN_WARN : "qx/app/apiviewer/image/mixin_warning18.gif",

    /** {string} The icon URL of a public method. */
    ICON_METHOD_PUB : "qx/app/apiviewer/image/method_public18.gif",

    /** {string} The icon URL of a public inherited method. */
    ICON_METHOD_PUB_INHERITED : "qx/app/apiviewer/image/method_public_inherited18.gif",

    /** {string} The icon URL of a constructor. */
    ICON_CTOR : "qx/app/apiviewer/image/constructor18.gif",

    /** {string} The icon URL of a protected method. */
    ICON_METHOD_PROT : "qx/app/apiviewer/image/method_protected18.gif",

    /** {string} The icon URL of a private method. */
    ICON_METHOD_PRIV : "qx/app/apiviewer/image/method_private18.gif",

    /** {string} The icon URL of a internal method. */
    ICON_METHOD_INTERN : "qx/app/apiviewer/image/method_internal18.gif",

    /** {string} The icon URL of a constant. */
    ICON_CONSTANT : "qx/app/apiviewer/image/constant18.gif",

    /** {string} The icon URL of an appearance. */
    ICON_APPEARANCE : "qx/app/apiviewer/image/constant18.gif",

    /** {string} The icon URL of a child control. */
    ICON_CHILDCONTROL : "qx/app/apiviewer/image/childcontrol18.gif"
  },


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    /** {string[]} images to preload */
    statics.PRELOAD_IMAGES = [
      statics.ICON_INFO,
      statics.ICON_SEARCH,
      statics.OVERLAY_ABSTRACT,
      statics.OVERLAY_ERROR,
      statics.OVERLAY_INHERITED,
      statics.OVERLAY_OVERRIDDEN,
      statics.OVERLAY_STATIC,
      statics.OVERLAY_WARN,
      statics.OVERLAY_MIXIN,
      statics.OVERLAY_THEMEABLE,
      statics.ICON_PACKAGE,
      statics.ICON_PACKAGE_WARN,
      statics.ICON_CLASS,
      statics.ICON_CLASS_WARN,
      statics.ICON_CLASS_ERROR,
      statics.ICON_CLASS_STATIC,
      statics.ICON_CLASS_STATIC_WARN,
      statics.ICON_CLASS_STATIC_ERROR,
      statics.ICON_CLASS_ABSTRACT,
      statics.ICON_CLASS_ABSTRACT_WARN,
      statics.ICON_CLASS_ABSTRACT_ERROR,
      statics.ICON_CLASS_SINGLETON,
      statics.ICON_CLASS_SINGLETON_WARN,
      statics.ICON_CLASS_SINGLETON_ERROR,
      statics.ICON_PROPERTY_PUB,
      statics.ICON_PROPERTY_PROT,
      statics.ICON_PROPERTY_PRIV,
      statics.ICON_PROPERTY_INTERN,
      statics.ICON_PROPERTY_PUB_THEMEABLE,
      statics.ICON_EVENT,
      statics.ICON_INTERFACE,
      statics.ICON_INTERFACE_WARN,
      statics.ICON_MIXIN,
      statics.ICON_MIXIN_WARN,
      statics.ICON_METHOD_PUB,
      statics.ICON_METHOD_PUB_INHERITED,
      statics.ICON_CTOR,
      statics.ICON_METHOD_PROT,
      statics.ICON_METHOD_PRIV,
      statics.ICON_METHOD_INTERN,
      statics.ICON_CONSTANT,
      statics.ICON_CHILDCONTROL
    ];
  }
});
