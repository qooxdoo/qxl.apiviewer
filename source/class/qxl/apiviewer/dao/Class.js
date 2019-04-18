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
 * This Class wraps the access to the documentation data of classes.
 */
qx.Class.define("qxl.apiviewer.dao.Class", {
  extend: qxl.apiviewer.dao.Node,

  /**
   * @param classDocNode
   *          {Map} class documentation node
   */
  construct: function (className) {
    this.base(arguments);
    this._className = className;
    this._package = qxl.apiviewer.dao.Package.getParentPackage(className);
    this._package.addClass(this);
  },

  members: {
    _package: null,
    _construct: null,
    _destruct: null,
    _defer: null,
    _staticMethods: null,
    _constants: null,
    _members: null,
    _mixinMembers: null,
    _properties: null,
    _mixinProperties: null,
    _events: null,
    _mixinEvents: null,
    _superClass: null,
    _superInterfaces: null,
    _superMixins: null,
    _mixins: null,

    _loadingPromise: null,
    _loaded: false,

    /**
     * Loads the class
     *
     * @return {Promise}
     */
    load: function () {
      if (this._loadingPromise) {
        return this._loadingPromise;
      }

      var url = qxl.apiviewer.ClassLoader.getBaseUri() + "/transpiled/" + this._className.replace(/\./g, "/") + ".json";
      return this._loadingPromise = qxl.apiviewer.RequestUtil.get(url)
        .then(content => {
          var meta = eval("(" + content + ")");
          return this._initMeta(meta)
            .then(() => {
              this._loaded = true;
              return this;
            });
        })
        .catch(e => {
          this.error("Couldn't load file: " + url + " " + e.message);
        });
    },

    isLoaded: function () {
      return this._loaded;
    },

    /**
     * Loads meta data, including super classes/interfaces/mixins
     *
     * @return {qx.Promise}
     */
    _initMeta: function (meta) {
      this.base(arguments, meta);

      this._jsdoc = meta.clazz.jsdoc || {};

      this._construct = meta.construct ? [new qxl.apiviewer.dao.Method(meta.construct, this, "construct")] : [];
      this._destruct = meta.destruct ? [new qxl.apiviewer.dao.Method(meta.destruct, this, "destruct")] : [];
      this._defer = meta.defer ? [new qxl.apiviewer.dao.Method(meta.defer, this, "defer")] : [];

      this._staticMethods = [];
      this._constants = [];
      if (meta.statics) {
        for (let name in meta.statics) {
          let data = meta.statics[name];
          if (data.type == "variable") {
            this._constants.push(new qxl.apiviewer.dao.Constant(data, this, name));
          } else {
            this._staticMethods.push(new qxl.apiviewer.dao.Method(data, this, name));
          }
        }
      }

      this._members = [];
      this._mixinMembers = [];
      if (meta.members) {
        for (let name in meta.members) {
          let data = meta.members[name];
          if (data.type == "function") {
            let obj = new qxl.apiviewer.dao.Method(data, this, name);
            if (data.mixin) {
              this._mixinMembers.push(obj);
            } else {
              this._members.push(obj);
            }
          }
        }
      }

      this._properties = [];
      this._mixinProperties = [];
      if (meta.properties) {
        for (let name in meta.properties) {
          let data = meta.properties[name];
          let obj = new qxl.apiviewer.dao.Property(data, this, name);
          if (data.mixin) {
            this._mixinProperties.push(obj);
          } else {
            this._properties.push(obj);
          }
        }
      }

      this._events = [];
      this._mixinEvents = [];
      if (meta.events) {
        for (let name in meta.events) {
          let data = meta.events[name];
          let obj = new qxl.apiviewer.dao.Event(data, this);
          if (data.mixin) {
            this._mixinEvents.push(obj);
          } else {
            this._events.push(obj);
          }
        }
      }

      this._childControls = [];
      let arr = this._jsdoc["@childControl"];
      if (arr) {
        arr.forEach(elem => {
          this._childControls.push(new qxl.apiviewer.dao.ChildControl(elem, this));
        });
      }

      var all = [];
      function findClasses(tmp) {
        let p = qxl.apiviewer.dao.Class.findClasses(tmp);
        return p.then(classes => {
          classes.forEach(item => {
            all.push(item);
          })
          return classes;
        });
      }

      this._superClass = null;
      this._superInterfaces = [];
      this._superMixins = [];
      if (this._meta.type == "interface") {
        all.push(findClasses(meta.superClass).then(arr => this._superInterfaces = arr));
      } else if (this._meta.type == "mixin") {
        all.push(findClasses(meta.superClass).then(arr => this._superMixins = arr));
      } else {
        all.push(findClasses(meta.superClass).then(arr => this._superClass = arr[0] || null));
      }
      this._interfaces = [];
      findClasses(meta.interfaces).then(arr => this._interfaces = arr);
      this._mixins = [];
      findClasses(meta.mixins).then(arr => this._mixins = arr);
      return qx.Promise.all(all);
    },

    getPackage: function () {
      return this._package;
    },

    /**
     * Get the name of the class.
     *
     * @return {String} name of the class
     */
    getName: function () {
      return this._className;
    },


    /**
     * Get the full name of the class, including the package name.
     *
     * @return {String} full name of the class
     */
    getFullName: function () {
      return this._className;
    },


    /**
     * Get the package name of the class.
     *
     * @return {String} package name of the class
     */
    getPackageName: function () {
      return this._package.getFullName();
    },


    /**
     * Get type of the class. Valid types are "class", "interface" and "mixin".
     *
     * @return {String} The type of the class. Valid types are "class",
     *         "interface" and "mixin".
     */
    getType: function () {
      return this._meta.type;
    },


    /**
     * Get whether the class is abstract.
     *
     * @return {Boolean} Whether the class is abstract.
     */
    isAbstract: function () {
      return this._meta.isAbstract || false;
    },


    /**
     * Get whether the class is a static class.
     *
     * @return {Boolean} Whether the class is static.
     */
    isStatic: function () {
      return this._meta.isStatic || false;
    },


    /**
     * Get whether the class is a singleton.
     *
     * @return {Boolean} Whether the class is a singleton.
     */
    isSingleton: function () {
      return this._meta.isSingleton || false;
    },


    /**
     * Get the super class of the class.
     *
     * @return {qxl.apiviewer.dao.Class} The super class of the class.
     */
    getSuperClass: function () {
      return this._superClass;
    },


    /**
     * Get the direct child classes of the class.
     *
     * @return {qx.Promise(qxl.apiviewer.dao.Class[])} A list of direct child classes of the
     *         class.
     */
    getChildClasses: function () {
      if (!this._childClassesPromise) {
        if (this._meta.type == "class") {
          this._childClassesPromise = qxl.apiviewer.dao.Class.findClasses(this._meta.descendants);
        } else {
          this._childClassesPromise = qx.Promise.resolve([]);
        }
      }
      return this._childClassesPromise;
    },


    /**
     * Get all interfaces declared at the class declaration.
     *
     * @return {qxl.apiviewer.dao.Class[]} All interfaces declared at the class
     *         declaration.
     */
    getInterfaces: function () {
      return this._interfaces;
    },

    /**
     * Get all super interfaces. (Only for interfaces)
     *
     * @return {qxl.apiviewer.dao.Class[]} All super interfaces.
     */
    getSuperInterfaces: function () {
      return this._superInterfaces;
    },

    /**
     * Get all mixins declared at the class declaration.
     *
     * @return {qxl.apiviewer.dao.Class[]} All mixins declared at the class
     *         declaration.
     */
    getMixins: function () {
      return this._mixins;
    },

    /**
     * Get all super mixins. (Only for mixins)
     *
     * @return {qxl.apiviewer.dao.Class[]} All super mixins.
     */
    getSuperMixins: function () {
      return this._superMixins;
    },

    /**
     * Get all classes including this mixin. (Only for mixins)
     *
     * @return {qx.Promise(qxl.apiviewer.dao.Class[])} All classes including this mixin.
     */
    getIncluder: function () {
      if (!this._includersPromise) {
        if (this._meta.type == "mixin") {
          this._includersPromise = qxl.apiviewer.dao.Class.findClasses(this._meta.descendants);
        } else {
          this._includersPromise = qx.Promise.resolve([]);
        }
      }
      return this._includersPromise;
    },

    /**
     * Get all implementations of this interface. (Only for interfaces)
     *
     * @return {qx.Promise(qxl.apiviewer.dao.Class[])} All implementations of this interface.
     */
    getImplementations: function () {
      if (!this._implementationsPromise) {
        if (this._meta.type == "interface") {
          this._implementationsPromise = qxl.apiviewer.dao.Class.findClasses(this._meta.descendants);
        } else {
          this._implementationsPromise = qx.Promise.resolve([]);
        }
      }
      return this._implementationsPromise;
    },

    /**
     * Get the constructor of the class.
     *
     * @return {qxl.apiviewer.dao.Method} The constructor of the class.
     */
    getConstructor: function () {
      return this._construct;
    },


    /**
     * Get all child controls
     *
     * @return {qxl.apiviewer.dao.ChildControl[]} All child controls.
     */
    getChildControls: function () {
      return this._childControls;
    },

    /**
     * Get the members of the class.
     *
     * @return {qxl.apiviewer.dao.Method[]} The members of the class.
     * @deprecated Is this used any more????
     */
    getMembers: function () {
      return this._members;
    },

    /**
     * Get the members of the class.
     *
     * @return {qxl.apiviewer.dao.Method[]} The members of the class.
     */
    getMethods: function () {
      return this._members;
    },

    /**
     * Get the members of the class, contributed from mixins
     *
     * @return {qxl.apiviewer.dao.Method[]} The members of the class.
     * @deprecated Is this used any more????
     */
    getMixinMembers: function () {
      return this._mixinMembers;
    },

    /**
     * Get the members of the class, contributed from mixins
     *
     * @return {qxl.apiviewer.dao.Method[]} The members of the class.
     */
    getMixinMethods: function () {
      return this._mixinMembers;
    },

    /**
     * Get the statics of the class.
     *
     * @return {qxl.apiviewer.dao.Method[]} The statics of the class.
     */
    getStatics: function () {
      return this._staticMethods;
    },

    /**
     * Get the events of the class.
     *
     * @return {qxl.apiviewer.dao.Event[]} The events of the class.
     */
    getEvents: function () {
      return this._events;
    },

    /**
     * Get the events of the class, contributed from mixins
     *
     * @return {qxl.apiviewer.dao.Event[]} The events of the class.
     */
    getMixinEvents: function () {
      return this._mixinEvents;
    },

    /**
     * Get the properties of the class.
     *
     * @return {qxl.apiviewer.dao.Property[]} The properties of the class.
     */
    getProperties: function () {
      return this._properties;
    },

    /**
     * Returns a property with a given name
     *
     * @return {qxl.apiviewer.dao.Property} The named property
     */
    getProperty: function (name) {
      for (var i = 0; i < this._properties.length; i++) {
        var prop = this._properties[i];
        if (prop.getName() == name) {
          return prop;
        }
      }
      return null;
    },

    /**
     * Get the properties of the class, contributed from mixins
     *
     * @return {qxl.apiviewer.dao.Property[]} The properties of the class.
     */
    getMixinProperties: function () {
      return this._mixinProperties;
    },

    /**
     * Get the constants of the class.
     *
     * @return {qxl.apiviewer.dao.Constant[]} The constants of the class.
     */
    getConstants: function () {
      return this._constants;
    },

    /**
     * Get all references declared using the "see" attribute.
     *
     * @return {String[]} A list of all references declared using the "see" attribute.
     */
    getSee: function () {
      return (this._jsdoc["@see"] || []).map(item => item.body);
    },

    getErrors: function () {
      return [];
    },

    /* COMPLEX FUNCTIONS */

    /**
     * Get the documentation nodes of all classes in the inheritance chain of a
     * class. The first entry in the list is the class itself.
     *
     * @param includeNativeObjects
     *          {Boolean} true if you want to get native JS objects too
     * @return {qxl.apiviewer.dao.Class[]} array of super classes of the given
     *         class.
     */
    getClassHierarchy: function (includeNativeObjects) {
      var result = [];
      for (var currentClass = this; currentClass; currentClass = currentClass.getSuperClass()) {
        var isNative = qxl.apiviewer.dao.Class.isNativeObject(currentClass);
        if (!isNative || includeNativeObjects) {
          result.push(currentClass);
        }
        if (isNative) {
          break;
        }
      }
      return result;
    },


    /**
     * Get the documentation nodes of all interfaces in the inheritance chain of
     * an interface. The first entry in the list is the interface itself.
     *
     * @return {qxl.apiviewer.dao.Class[]} array of super interfaces of the given
     *         interface.
     */
    getInterfaceHierarchy: function () {
      var currentClass = this;
      var result = [];

      function add(currentClass) {
        result.push(currentClass);
        currentClass.getSuperInterfaces().forEach(itf => add(itf));
      }
      add(this);

      return result;
    },

    /**
     * Returns a list of all interfaces the class implements directly.
     *
     * @param includeSuperClasses
     *          {Boolean?false} Whether the interfaces of all super classes
     *          should be returned as well.
     */
    getAllInterfaces: function (includeSuperClasses) {
      var interfaceNodes = [];

      let ifaceRecurser = ifaceNode => {
        interfaceNodes.push(ifaceNode);
        ifaceNode.getSuperInterfaces().forEach(ifaceRecurser);
      };

      var classNodes = includeSuperClasses ? this.getClassHierarchy() : [this];
      classNodes.forEach(classNode => classNode.getInterfaces().forEach(ifaceRecurser));

      return interfaceNodes;
    },


    /**
     * Return a class item matching the given name.
     *
     * @param itemName
     *          {String} name of the class item
     * @return {qxl.apiviewer.dao.ClassItem} the class item.
     */
    getItemByNameFromMixins: function (itemName) {
      return this._mixinMembers[itemName] ||
        this._mixinProperties[itemName] ||
        this._mixinEvents[itemName] ||
        null;
    },

    /**
     * Return a class item matching the given name.
     *
     * @param itemName {String} name of the class item
     * @return {qxl.apiviewer.dao.ClassItem} the class item.
     */
    getItem: function (itemName) {
      var itemListNames = [
        "getMembers",
        "getStatics",
        "getEvents",
        "getProperties",
        "getConstants",
        // "getAppearances",
        "getChildControls"
      ];

      for (var i = 0; i < itemListNames.length; i++) {
        var list = this[itemListNames[i]]();
        if (list) {
          for (var j = 0; j < list.length; j++) {
            if (itemName == list[j].getName()) {
              return list[j];
            }
          }
        }
      }

      return null;
    },

    loadDependedClasses: function () {
      return qxl.apiviewer.ClassLoader.loadClassList(this.getDependedClasses());
    },

    /**
     * Return a list of all classes, mixins and interfaces this class depends
     * on. This includes all super classes and their mixins/interfaces and the
     * class itself.
     *
     * @return {qx.Promise(Class[])} array of dependent classes.
     */
    getDependedClasses: function () {
      let foundClasses = [];

      function findClasses(clazz) {
        if (qxl.apiviewer.dao.Class.isNativeObject(clazz)) {
          return;
        }
        return clazz.load().then(() => {

        });

        foundClasses.push(clazz);
        clazz.getSuperClass() && findClasses(clazz.getSuperClass());
        clazz.getMixins().forEach(mixin => findClasses);
        clazz.getSuperMixins().forEach(mixin => findClasses);
        clazz.getInterfaces().forEach(mixin => findClasses);
        clazz.getSuperInterfaces().forEach(mixin => findClasses);
      }

      findClasses(this);
      return foundClasses;
    }
  },

  statics: {
    _native_classes: {
      "Array": Array,
      "Boolean": Boolean,
      "Date": Date,
      "Error": Error,
      "Function": Function,
      "Math": Math,
      "Number": Number,
      "Object": Object,
      "RegExp": RegExp,
      "String": String
    },

    /**
     * Get a class documentation by the class name.
     *
     * @param className
     *          {String} name of the class
     * @return {qxl.apiviewer.dao.Class} The class documentation
     */
    getClassByName: function (className, create) {
      var nativeClass = qxl.apiviewer.dao.Class._native_classes[className];
      if (nativeClass !== undefined) {
        return nativeClass;
      }

      var pkg = qxl.apiviewer.dao.Package.getParentPackage(className);
      if (!pkg) {
        throw new Error("Cannot find a package for " + className);
      }

      var cls = pkg.getClassByName(className);
      if (!cls && create) {
        cls = new qxl.apiviewer.dao.Class(className);
      }
      return cls;
    },


    /**
     * Get a class documentation by the class name.
     *
     * @param className
     *          {String} name of the class
     * @return {qxl.apiviewer.dao.Class} The class documentation
     */
    getClassesByName: function (classNames, create) {
      classNames = qx.lang.Array.toNativeArray(classNames);
      var result = classNames.map(name => qxl.apiviewer.dao.Class.getClassByName(name, create));
      return result;
    },


    findClasses: function (name) {
      if (!name) {
        return qx.Promise.resolve([]);
      }
      var all = qx.lang.Array.toNativeArray(name)
        .filter(name => !qxl.apiviewer.dao.Class._native_classes[name])
        .map(name => {
          let c = qxl.apiviewer.dao.Class.getClassByName(name);
          if (c) {
            c.load();
          }
          return c;
        });
      return qx.Promise.all(all);
    },


    /**
     * Checks if the Class is a qooxdoo qxl.apiviewer.dao.Class Object or a native
     * one
     *
     * @param clazz
     *          {qxl.apiviewer.dao.Class} the object to be checked
     * @return {Boolean} true if it is a JS native object
     */
    isNativeObject: function (clazz) {
      return clazz.classname !== "qxl.apiviewer.dao.Class";
    }

  }
});