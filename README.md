# Qooxdoo API Viewer

This is the API Viewer package for Qooxdoo, which you can use to generate
an API Viewer for your own application. 

## Online version (qx namespace)

http://api.qooxdoo.org 

## Adding an API viewer for your own code
```
$ qx pkg update
$ qx pkg install qooxdoo/qxl.apiviewer
$ qx serve -S
```

Then open [http://localhost:8080](http://localhost:8080).  You
will see that you now have a new application listed,
the "API Viewer", that you can click on the link to run it.

## Environment variables

You can control the behavior of the API Viewer via settings in the "environment"
map in `compile.json`:

```json5
  "environment": {
    // list of applications to scan
    "qxl.apiviewer.applications": [],
    // name of app for which to create the API Viewer, defaults to first application
    "qxl.apiviewer.applicationName": "",
    // array of classes which should be excluded
    "qxl.apiviewer.exclude": [
      "qx.*",
      "namespace.*" 
    ],
    // array of classes which should be included despite the "exclude" setting
    "qxl.apiviewer.include": [
      "namespace.subnamespace.*"
    ]
  },
``` 


## Developing API Viewer

Clone this repo and compile it:

```bash
$ git clone https://github.com/qooxdoo/qxl.apiviewer
$ cd qxl.apiviewer
$ npm install --no-save --no-package-lock @qooxdoo/compiler
$ npx qx serve
```


