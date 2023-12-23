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
qx.Class.define("qxl.apiviewer.RequestUtil", {
  extend: qx.core.Object,

  statics: {
    get(url, opts) {
      if (qx.core.Environment.get("qx.compiler.applicationType") == "node") {
        let fs = require("fs");
        return fs.promises.readFile(url, "utf-8");
      } else {
        return new qx.Promise((resolve, reject) => {
          var req = new qx.io.remote.Request(url);
          req.setAsynchronous(true);
          req.setTimeout(180000);
          req.setProhibitCaching(false);
          if (opts) {
            req.set(opts);
          }
          req.addListener("completed", evt => {
            resolve(evt.getContent());
          });
          req.addListener("failed", () => reject());
          req.addListener("aborted", () => reject());
          req.send();
        });
      }
    }
  }
});
