(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Bootstrap": {
        "usage": "dynamic",
        "require": true
      },
      "qx.core.IDisposable": {
        "require": true
      },
      "qx.lang.Function": {},
      "qx.bom.Event": {},
      "qx.bom.Viewport": {}
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2012 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Tino Butz (tbtz)
       * Daniel Wagner (danielwagner)
  
     ======================================================================
  
     This class contains code based on the following work:
  
     * Unify Project
  
       Homepage:
         http://unify-project.org
  
       Copyright:
         2009-2010 Deutsche Telekom AG, Germany, http://telekom.com
  
       License:
         MIT: http://www.opensource.org/licenses/mit-license.php
  
  ************************************************************************ */

  /**
   * Listens for native orientation change events
   * 
   * NOTE: Instances of this class must be disposed of after use
   *
   */
  qx.Bootstrap.define("qx.event.handler.OrientationCore", {
    extend: Object,
    implement: [qx.core.IDisposable],

    /**
     *
     * @param targetWindow {Window} DOM window object
     * @param emitter {qx.event.Emitter} Event emitter object
     */
    construct: function construct(targetWindow, emitter) {
      this._window = targetWindow || window;
      this.__P_136_0 = emitter;

      this._initObserver();
    },
    members: {
      __P_136_0: null,
      _window: null,
      _currentOrientation: null,
      __P_136_1: null,
      __P_136_2: null,

      /*
      ---------------------------------------------------------------------------
        OBSERVER INIT
      ---------------------------------------------------------------------------
      */

      /**
       * Initializes the native orientation change event listeners.
       */
      _initObserver: function _initObserver() {
        this.__P_136_1 = qx.lang.Function.listener(this._onNative, this); // Handle orientation change event for Android devices by the resize event.
        // See http://stackoverflow.com/questions/1649086/detect-rotation-of-android-phone-in-the-browser-with-javascript
        // for more information.

        this.__P_136_2 = qx.bom.Event.supportsEvent(this._window, "orientationchange") ? "orientationchange" : "resize";
        qx.bom.Event.addNativeListener(this._window, this.__P_136_2, this.__P_136_1);
      },

      /*
      ---------------------------------------------------------------------------
        OBSERVER STOP
      ---------------------------------------------------------------------------
      */

      /**
       * Disconnects the native orientation change event listeners.
       */
      _stopObserver: function _stopObserver() {
        qx.bom.Event.removeNativeListener(this._window, this.__P_136_2, this.__P_136_1);
      },

      /*
      ---------------------------------------------------------------------------
        NATIVE EVENT OBSERVERS
      ---------------------------------------------------------------------------
      */

      /**
       * Handler for the native orientation change event.
       *
       * @signature function(domEvent)
       * @param domEvent {Event} The touch event from the browser.
       */
      _onNative: function _onNative(domEvent) {
        var orientation = qx.bom.Viewport.getOrientation();

        if (this._currentOrientation != orientation) {
          this._currentOrientation = orientation;
          var mode = qx.bom.Viewport.isLandscape() ? "landscape" : "portrait";
          domEvent._orientation = orientation;
          domEvent._mode = mode;

          if (this.__P_136_0) {
            this.__P_136_0.emit("orientationchange", domEvent);
          }
        }
      }
    },

    /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */
    destruct: function destruct() {
      this._stopObserver();

      this.__P_136_3 = this.__P_136_0 = null;
    }
  });
  qx.event.handler.OrientationCore.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=OrientationCore.js.map?dt=1590225833848