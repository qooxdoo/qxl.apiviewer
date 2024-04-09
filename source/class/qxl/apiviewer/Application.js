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
 * Your apiviewer application
 *
 * @asset(qxl/apiviewer/*)
 */
qx.Class.define("qxl.apiviewer.Application", {
  extend: qx.application.Standalone,

  construct() {
    super();
    var uri = qx.util.ResourceManager.getInstance().toUri("qxl/apiviewer/css/apiviewer.css");
    qx.bom.Stylesheet.includeFile(uri);
  },

  members: {
    // overridden
    async main() {
      await super.main();

      // Add log appenders
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }
      qx.Class.include(qx.ui.core.Widget, qxl.apiviewer.MWidgetRegistry);
      this.viewer = new qxl.apiviewer.Viewer();
      this.controller = new qxl.apiviewer.Controller();

      let json = await qxl.apiviewer.RequestUtil.get(qxl.apiviewer.ClassLoader.getBaseUri() + "apiviewer.json");
      json = JSON.parse(json);

      this.viewer._searchView.apiindex = json.apiindex;
      this.controller.load(json.classes);

      this.getRoot().add(this.viewer, { edge: 0 });
    }
  },

  destruct() {
    this._disposeObjects("viewer", "controller");
  }
});
