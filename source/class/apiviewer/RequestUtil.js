qx.Class.define("apiviewer.RequestUtil", {
  extend: qx.core.Object,
  
  statics: {
    get: function(url, opts) {
      return new qx.Promise((resolve, reject) => {
        var req = new qx.io.remote.Request(url);

        req.setAsynchronous(true);
        req.setTimeout(180000);
        req.setProhibitCaching(false);
        if (opts)
          req.set(opts);

        req.addListener("completed", evt => {
          resolve(evt.getContent());
        });
        
        req.addListener("failed", () => reject());
        req.addListener("aborted", () => reject());
        
        req.send();
      });
    }
  }
});
