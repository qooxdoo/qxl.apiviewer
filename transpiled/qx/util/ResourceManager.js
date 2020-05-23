(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.core.Environment": {
        "defer": "load",
        "require": true
      },
      "qx.Class": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.Object": {
        "construct": true,
        "require": true
      },
      "qx.bom.client.Device": {},
      "qx.bom.client.Engine": {
        "defer": "runtime"
      },
      "qx.bom.client.Transport": {
        "defer": "runtime"
      },
      "qx.util.LibraryManager": {
        "defer": "runtime"
      }
    },
    "environment": {
      "provided": [],
      "required": {
        "engine.name": {
          "className": "qx.bom.client.Engine",
          "defer": true
        },
        "io.ssl": {
          "className": "qx.bom.client.Transport",
          "defer": true
        }
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Sebastian Werner (wpbasti)
       * Fabian Jakobs (fjakobs)
  
  ************************************************************************ */

  /**
   * Contains information about images (size, format, clipping, ...) and
   * other resources like CSS files, local data, ...
   */
  qx.Class.define("qx.util.ResourceManager", {
    extend: qx.core.Object,
    type: "singleton",

    /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
    */
    construct: function construct() {
      qx.core.Object.constructor.call(this);
    },

    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
    statics: {
      /** @type {Map} the shared image registry */
      __P_413_0: qx.$$resources || {},

      /** @type {Map} prefix per library used in HTTPS mode for IE */
      __P_413_1: {}
    },

    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */
    members: {
      /**
       * Detects whether there is a high-resolution image available.
       * A high-resolution image is assumed to have the same file name as
       * the parameter source, but with a pixelRatio identifier before the file
       * extension, like "@2x".
       * Medium Resolution: "example.png", high-resolution: "example@2x.png"
       *
       * @param lowResImgSrc {String} source of the low resolution image.
       * @param factor {Number} Factor to find the right image. If not set calculated by getDevicePixelRatio()
       * @return {String|Boolean} If a high-resolution image source.
       */
      findHighResolutionSource: function findHighResolutionSource(lowResImgSrc, factor) {
        var pixelRatioCandidates = ["3", "2", "1.5"]; // Calculate the optimal ratio, based on the rem scale factor of the application and the device pixel ratio.

        if (!factor) {
          factor = parseFloat(qx.bom.client.Device.getDevicePixelRatio().toFixed(2));
        }

        if (factor <= 1) {
          return false;
        }

        var i = pixelRatioCandidates.length;

        while (i > 0 && factor > pixelRatioCandidates[--i]) {}

        var hiResImgSrc;
        var k; // Search for best img with a higher resolution.

        for (k = i; k >= 0; k--) {
          hiResImgSrc = this.getHighResolutionSource(lowResImgSrc, pixelRatioCandidates[k]);

          if (hiResImgSrc) {
            return hiResImgSrc;
          }
        } // Search for best img with a lower resolution.


        for (k = i + 1; k < pixelRatioCandidates.length; k++) {
          hiResImgSrc = this.getHighResolutionSource(lowResImgSrc, pixelRatioCandidates[k]);

          if (hiResImgSrc) {
            return hiResImgSrc;
          }
        }

        return null;
      },

      /**
       * Returns the source name for the high-resolution image based on the passed
       * parameters.
       * @param source {String} the source of the medium resolution image.
       * @param pixelRatio {Number} the pixel ratio of the high-resolution image.
       * @return {String} the high-resolution source name or null if no source could be found.
       */
      getHighResolutionSource: function getHighResolutionSource(source, pixelRatio) {
        var fileExtIndex = source.lastIndexOf('.');

        if (fileExtIndex > -1) {
          var pixelRatioIdentifier = "@" + pixelRatio + "x";
          var candidate = source.slice(0, fileExtIndex) + pixelRatioIdentifier + source.slice(fileExtIndex);

          if (this.has(candidate)) {
            return candidate;
          }
        }

        return null;
      },

      /**
       * Get all known resource IDs.
       *
       * @param pathfragment{String|null|undefined} an optional path fragment to check against with id.indexOf(pathfragment)
       * @return {Array|null} an array containing the IDs or null if the registry is not initialized
       */
      getIds: function getIds(pathfragment) {
        var registry = qx.util.ResourceManager.__P_413_0;

        if (!registry) {
          return null;
        }

        var ids = [];

        for (var id in registry) {
          if (registry.hasOwnProperty(id)) {
            if (pathfragment && id.indexOf(pathfragment) == -1) {
              continue;
            }

            ids.push(id);
          }
        }

        return ids;
      },

      /**
       * Whether the registry has information about the given resource.
       *
       * @param id {String} The resource to get the information for
       * @return {Boolean} <code>true</code> when the resource is known.
       */
      has: function has(id) {
        return !!qx.util.ResourceManager.__P_413_0[id];
      },

      /**
       * Get information about an resource.
       *
       * @param id {String} The resource to get the information for
       * @return {Array} Registered data or <code>null</code>
       */
      getData: function getData(id) {
        return qx.util.ResourceManager.__P_413_0[id] || null;
      },

      /**
       * Returns the width of the given resource ID,
       * when it is not a known image <code>0</code> is
       * returned.
       *
       * @param id {String} Resource identifier
       * @return {Integer} The image width, maybe <code>null</code> when the width is unknown
       */
      getImageWidth: function getImageWidth(id) {
        var size;

        if (id && id.startsWith("@")) {
          var part = id.split("/");
          size = parseInt(part[2], 10);

          if (size) {
            id = part[0] + "/" + part[1];
          }
        }

        var entry = qx.util.ResourceManager.__P_413_0[id]; // [ width, height, codepoint ]

        if (size && entry) {
          var width = Math.ceil(size / entry[1] * entry[0]);
          return width;
        }

        return entry ? entry[0] : null;
      },

      /**
       * Returns the height of the given resource ID,
       * when it is not a known image <code>0</code> is
       * returned.
       *
       * @param id {String} Resource identifier
       * @return {Integer} The image height, maybe <code>null</code> when the height is unknown
       */
      getImageHeight: function getImageHeight(id) {
        if (id && id.startsWith("@")) {
          var part = id.split("/");
          var size = parseInt(part[2], 10);

          if (size) {
            return size;
          }
        }

        var entry = qx.util.ResourceManager.__P_413_0[id];
        return entry ? entry[1] : null;
      },

      /**
       * Returns the format of the given resource ID,
       * when it is not a known image <code>null</code>
       * is returned.
       *
       * @param id {String} Resource identifier
       * @return {String} File format of the image
       */
      getImageFormat: function getImageFormat(id) {
        if (id && id.startsWith("@")) {
          return "font";
        }

        var entry = qx.util.ResourceManager.__P_413_0[id];
        return entry ? entry[2] : null;
      },

      /**
       * Returns the format of the combined image (png, gif, ...), if the given
       * resource identifier is an image contained in one, or the empty string
       * otherwise.
       *
       * @param id {String} Resource identifier
       * @return {String} The type of the combined image containing id
       */
      getCombinedFormat: function getCombinedFormat(id) {
        var clippedtype = "";
        var entry = qx.util.ResourceManager.__P_413_0[id];
        var isclipped = entry && entry.length > 4 && typeof entry[4] == "string" && this.constructor.__P_413_0[entry[4]];

        if (isclipped) {
          var combId = entry[4];
          var combImg = this.constructor.__P_413_0[combId];
          clippedtype = combImg[2];
        }

        return clippedtype;
      },

      /**
       * Converts the given resource ID to a full qualified URI
       *
       * @param id {String} Resource ID
       * @return {String} Resulting URI
       */
      toUri: function toUri(id) {
        if (id == null) {
          return id;
        }

        var entry = qx.util.ResourceManager.__P_413_0[id];

        if (!entry) {
          return id;
        }

        if (typeof entry === "string") {
          var lib = entry;
        } else {
          var lib = entry[3]; // no lib reference
          // may mean that the image has been registered dynamically

          if (!lib) {
            return id;
          }
        }

        var urlPrefix = "";

        if (qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("io.ssl")) {
          urlPrefix = qx.util.ResourceManager.__P_413_1[lib];
        }

        return urlPrefix + qx.util.LibraryManager.getInstance().get(lib, "resourceUri") + "/" + id;
      },

      /**
       * Construct a data: URI for an image resource.
       *
       * Constructs a data: URI for a given resource id, if this resource is
       * contained in a base64 combined image. If this is not the case (e.g.
       * because the combined image has not been loaded yet), returns the direct
       * URI to the image file itself.
       *
       * @param resid {String} resource id of the image
       * @return {String} "data:" or "http:" URI
       */
      toDataUri: function toDataUri(resid) {
        var resentry = this.constructor.__P_413_0[resid];
        var combined = resentry ? this.constructor.__P_413_0[resentry[4]] : null;
        var uri;

        if (combined) {
          var resstruct = combined[4][resid];
          uri = "data:image/" + resstruct["type"] + ";" + resstruct["encoding"] + "," + resstruct["data"];
        } else {
          uri = this.toUri(resid);
        }

        return uri;
      },

      /**
       * Checks whether a given resource id for an image is a font handle.
       *
       * @param resid {String} resource id of the image
       * @return {Boolean} True if it's a font URI
       */
      isFontUri: function isFontUri(resid) {
        return resid ? resid.startsWith("@") : false;
      }
    },
    defer: function defer(statics) {
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        // To avoid a "mixed content" warning in IE when the application is
        // delivered via HTTPS a prefix has to be added. This will transform the
        // relative URL to an absolute one in IE.
        // Though this warning is only displayed in conjunction with images which
        // are referenced as a CSS "background-image", every resource path is
        // changed when the application is served with HTTPS.
        if (qx.core.Environment.get("io.ssl")) {
          for (var lib in qx.$$libraries) {
            var resourceUri;

            if (qx.util.LibraryManager.getInstance().get(lib, "resourceUri")) {
              resourceUri = qx.util.LibraryManager.getInstance().get(lib, "resourceUri");
            } else {
              // default for libraries without a resourceUri set
              statics.__P_413_1[lib] = "";
              continue;
            }

            var href; //first check if there is base url set

            var baseElements = document.getElementsByTagName("base");

            if (baseElements.length > 0) {
              href = baseElements[0].href;
            } // It is valid to to begin a URL with "//" so this case has to
            // be considered. If the to resolved URL begins with "//" the
            // manager prefixes it with "https:" to avoid any problems for IE


            if (resourceUri.match(/^\/\//) != null) {
              statics.__P_413_1[lib] = window.location.protocol;
            } // If the resourceUri begins with a single slash, include the current
            // hostname
            else if (resourceUri.match(/^\//) != null) {
                if (href) {
                  statics.__P_413_1[lib] = href;
                } else {
                  statics.__P_413_1[lib] = window.location.protocol + "//" + window.location.host;
                }
              } // If the resolved URL begins with "./" the final URL has to be
              // put together using the document.URL property.
              // IMPORTANT: this is only applicable for the source version
              else if (resourceUri.match(/^\.\//) != null) {
                  var url = document.URL;
                  statics.__P_413_1[lib] = url.substring(0, url.lastIndexOf("/") + 1);
                } else if (resourceUri.match(/^http/) != null) {
                  // Let absolute URLs pass through
                  statics.__P_413_1[lib] = "";
                } else {
                  if (!href) {
                    // check for parameters with URLs as value
                    var index = window.location.href.indexOf("?");

                    if (index == -1) {
                      href = window.location.href;
                    } else {
                      href = window.location.href.substring(0, index);
                    }
                  }

                  statics.__P_413_1[lib] = href.substring(0, href.lastIndexOf("/") + 1);
                }
          }
        }
      }
    }
  });
  qx.util.ResourceManager.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=ResourceManager.js.map?dt=1590225863622