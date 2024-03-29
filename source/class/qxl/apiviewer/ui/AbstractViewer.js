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
     * Jonathan Weiß (jonathan_rass)
     * John Spackman (johnspackman)
     * Henner Kollmann (hkollmann)

************************************************************************ */

qx.Class.define("qxl.apiviewer.ui.AbstractViewer", {
  type: "abstract",
  extend: qx.ui.embed.Html,

  construct() {
    super();

    this._infoPanelHash = {};
    this._infoPanels = [];

    this.setOverflowX("auto");
    this.setOverflowY("auto");

    this.getContentElement().setStyle("-webkit-overflow-scrolling", "touch");
    this.getContentElement().setStyle("touch-action", "pan-y");
    this.getContentElement().setStyle("-ms-touch-action", "pan-y");

    this.setAppearance("detailviewer");

    this._infoPanelHash = {};
    this._infoPanels = [];

    qxl.apiviewer.ObjectRegistry.register(this);
  },

  properties: {
    /** The class to display */
    docNode: {
      init: null,
      nullable: true,
      apply: "_applyDocNode",
      async: true,
    },

    /** whether to display inherited items */
    showInherited: {
      check: "Boolean",
      init: false,
      apply: "_updatePanelsWithInheritedMembers",
    },

    /** whether to display included items */
    showIncluded: {
      check: "Boolean",
      init: true,
      apply: "_updatePanelsWithInheritedMembers",
    },

    /** whether to display protected items */
    expandProperties: {
      check: "Boolean",
      init: false,
      apply: "_updatePanels",
    },

    /** whether to display protected items */
    showProtected: {
      check: "Boolean",
      init: false,
      apply: "_updatePanels",
    },

    /** whether to display private items */
    showPrivate: {
      check: "Boolean",
      init: false,
      apply: "_updatePanels",
    },

    /** whether to display internal items */
    showInternal: {
      check: "Boolean",
      init: false,
      apply: "_updatePanels",
    },
  },

  statics: {
    /**
     * Change the target of all external links inside the given element to open in a new browser window.
     *
     * @param el {Element} Root element
     */
    fixLinks(el) {
      var a = el.getElementsByTagName("a");

      for (var i = 0; i < a.length; i++) {
        if (typeof a[i].href == "string" && a[i].href.indexOf("http://") == 0) {
          a[i].target = "_blank";
        }
      }
    },

    highlightCode(el) {
      var pres = el.getElementsByTagName("pre");

      for (var i = 0; i < pres.length; i++) {
        var element = pres[i];
        if (element.className !== "javascript") {
          continue;
        }
        if (qx.core.Environment.get("engine.name") == "mshtml") {
          // IE parser treats html added to a pre tag like normal html and removes
          // the whitespaces. To prevent this we create a wrapper element, add
          // to its innerHTML the pre tag and the javaScript code and replace the
          // existing pre element with the wrapper element.
          var preWrapper = document.createElement("div");
          var content = element.textContent || element.innerText;
          preWrapper.innerHTML =
            '<pre class="javascript">' +
            qx.dev.Tokenizer.javaScriptToHtml(content, true) +
            "</pre>";
          element.parentNode.replaceChild(preWrapper, element);
        } else {
          element.innerHTML = qx.dev.Tokenizer.javaScriptToHtml(
            element.textContent
          );
        }
      }
    },
  },

  events: {
    synced: "qx.event.type.Event",
  },

  members: {
    _infoPanelHash: null,
    _infoPanels: null,
    __valid: false,

    _init(pkg) {
      this.__initHtml();
      this.addListenerOnce("appear", () => this._syncHtml());
    },

    __initHtml() {
      var html = new qx.util.StringBuilder();

      html.add('<div style="padding:24px;">');

      // Add title
      html.add("<h1></h1>");

      // Add TOC
      html.add('<div class="tocContainer"></div>');

      // Add description
      html.add("<div>", "</div>");

      // render panels
      var panels = this.getPanels();

      for (var i = 0; i < panels.length; i++) {
        var panel = panels[i];
        html.add(panel.getPanelHtml(this));
      }

      html.add("</div>");

      this.setHtml(html.get());
    },

    /**
     * Returns the HTML fragment for the title
     *
     * @abstract
     * @param classNode {qxl.apiviewer.dao.Class} the class documentation node for the title
     * @return {String} HTML fragment of the title
     */
    _getTitleHtml(classNode) {
      throw new Error("Abstract method called!");
    },

    _getTocHtml(classNode) {
      throw new Error("Abstract method called!");
    },

    _getDescriptionHtml(classNode) {
      throw new Error("Abstract method called!");
    },

    /**
     * Initializes the content of the embedding DIV. Will be called by the
     * HtmlEmbed element initialization routine.
     *
     */
    async _syncHtml() {
      var oldTitleElem = this._titleElem;
      var element = this.getContentElement().getDomElement().firstChild;
      var divArr = element.childNodes;
      var panels = this.getPanels();

      qxl.apiviewer.ui.AbstractViewer.fixLinks(element);

      this._titleElem = divArr[0];
      this._tocElem = divArr[1];
      this._classDescElem = divArr[2];

      for (var i = 0; i < panels.length; i++) {
        var panel = panels[i];
        panel.setElement(divArr[i + 3]);
      }

      if (oldTitleElem !== this._titleElem && this.getDocNode()) {
        await this._applyDocNode(this.getDocNode());
      }
      this.__valid = true;
      this.fireEvent("synced");
    },

    isValid() {
      return this.__valid;
    },

    addInfoPanel(panel) {
      this._infoPanelHash[panel.toHashCode()] = panel;
      this._infoPanels.push(panel);
    },

    getPanels() {
      return this._infoPanels;
    },

    getPanelFromHashCode(hashCode) {
      return this._infoPanelHash[hashCode];
    },

    /**
     * Updates all info panels
     *
     * @return {qx.Promise}
     */
    _updatePanels() {
      if (!this.getDocNode()) {
        return qx.Promise.resolve();
      }
      qxl.apiviewer.LoadingIndicator.getInstance().show();
      var panels = this.getPanels();
      var all = panels.map((panel) => panel.update(this, this.getDocNode()));
      return qx.Promise.all(all).then(() =>
        qxl.apiviewer.LoadingIndicator.getInstance().hide()
      );
    },

    /**
     * Updates all info panels and TOC with items reflecting appearance/disappearance of panels
     * due to inherited members
     *
     * @return {qx.Promise}
     */
    _updatePanelsWithInheritedMembers() {
      if (!this.getDocNode()) {
        return qx.Promise.resolve();
      }
      return this._updatePanels().then(() => {
        if (this._tocElem) {
          qx.dom.Element.empty(this._tocElem);
          this._tocElem.appendChild(this._getTocHtml(this.getDocNode()));
        }
      });
    },

    /**
     * Shows the information about a class.
     *
     * @param classNode {qxl.apiviewer.dao.Class} the doc node of the class to show.
     */
    _applyDocNode(classNode) {
      if (!this._titleElem) {
        return null;
      }

      this._titleElem.innerHTML = this._getTitleHtml(classNode);
      qx.dom.Element.empty(this._tocElem);
      this._tocElem.appendChild(this._getTocHtml(classNode));

      return this._getDescriptionHtml(classNode).then((html) => {
        this._classDescElem.innerHTML = html;
        qxl.apiviewer.ui.AbstractViewer.fixLinks(this._classDescElem);
        qxl.apiviewer.ui.AbstractViewer.highlightCode(this._classDescElem);

        // Refresh the info viewers
        return this._updatePanels();
      });
    },

    /**
     * Event handler. Called when the user tapped a button for showing/hiding the
     * body of an info panel.
     * @param panel
     * @return {qx.Promise}
     */
    togglePanelVisibility(panel) {
      try {
        panel.setIsOpen(!panel.getIsOpen());

        var imgElem = panel.getTitleElement().getElementsByTagName("img")[0];
        imgElem.src = qx.util.ResourceManager.getInstance().toUri(
          panel.getIsOpen()
            ? "qxl/apiviewer/image/close.gif"
            : "qxl/apiviewer/image/open.gif"
        );

        return panel.update(this, this.getDocNode());
      } catch (exc) {
        this.error("Toggling info body failed", exc);
      }
      return null;
    },

    /**
     * Sorts the nodes in place.
     *
     * @param nodeArr {qxl.apiviewer.dao.ClassItem[]} array of class items
     */
    sortItems(nodeArr) {
      let WEIGHT = ["qxl.apiviewer.dao.Package", "qxl.apiviewer.dao.Class"];

      // Sort the nodeArr by name
      // Move protected methods to the end
      nodeArr.sort((obj1, obj2) => {
        if (obj1.classname != obj2.classname) {
          var w1 = WEIGHT.indexOf(obj1.classname);
          var w2 = WEIGHT.indexOf(obj2.classname);
          if (w1 < 0) {
            w1 = 999;
          }
          if (w2 < 0) {
            w2 = 999;
          }
          return w1 < w2 ? -1 : w1 > w2 ? 1 : 0;
        }

        if (obj1 instanceof qxl.apiviewer.dao.Package) {
          var n1 = obj1.getFullName().toLowerCase();
          var n2 = obj2.getFullName().toLowerCase();
          return n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
        }

        var sum1 = 0;
        if (obj1.isInternal()) {
          sum1 += 4;
        }
        if (obj1.isPrivate()) {
          sum1 += 2;
        }
        if (obj1.isProtected()) {
          sum1 += 1;
        }

        var sum2 = 0;
        if (obj2.isInternal()) {
          sum2 += 4;
        }
        if (obj2.isPrivate()) {
          sum2 += 2;
        }
        if (obj2.isProtected()) {
          sum2 += 1;
        }

        if (sum1 == sum2) {
          var name1 = obj1.getName();
          var name2 = obj2.getName();

          return name1.toLowerCase() < name2.toLowerCase() ? -1 : 1;
        }

        return sum1 - sum2;
      });
    },
  },
});
