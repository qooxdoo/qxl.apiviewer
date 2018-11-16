# Qooxdoo API Viewer

The is the API Viewer contrib for Qooxdoo; this initial release is just a self contained API viewer application, the next 
version will include support for adding this API viewer to your own application via the `qx` command.

** NOTE ** You MUST have the `qxcompiler` from my [johnspackman/qooxdoo-compiler/api-viewer](https://github.com/johnspackman/qooxdoo-compiler/tree/api-viewer) branch for this to work  

## Simple testing
Clone this repo and compile it:

```
    $ git clone https://github.com/qooxdoo/qooxdoo-api-viewer
    $ cd qooxdoo-api-viewer
    $ qx serve
```
Then open [http://localhost:8082](http://localhost:8082)

## Adding an API viewer for your own code
Clone this repo and amend your application's `compile.json` to add a new entry to the `"applications"` entry and add your clone of this repo as a library, for example:

```
    "applications": [
        {
            "class": "demoapp.Application",
            "theme": "demoapp.theme.Theme",
            "name": "demoapp",
            "title": "My Demo Application",
            "outputPath": "demoapp"
        },
        /** Note: Added a new application for the API viewer */
        {
            "class": "apiviewer.Application",
            "theme": "apiviewer.Theme",
            "name": "apiviewer",
            "title": "Qooxdoo API Viewer",
            "outputPath": "apiviewer"
        }
    ],
    
    /** Libraries */
    "libraries": [
        "../qooxdoo/framework",
        ".",
        "../qooxdoo-api-viewer"     /** Note: added API Viewer as a library */
    ],
```

Then start `qx serve` and browse to [http://localhost:8082](http://localhost:8082)

