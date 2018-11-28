# Qooxdoo API Viewer

The is the API Viewer contrib for Qooxdoo; this initial release is just a self contained API viewer application, the next 
version will include support for adding this API viewer to your own application via the `qx` command.


## Adding an API viewer for your own code
```
$ qx contrib update
$ qx contrib install qooxdoo/qooxdoo-api-viewer
$ qx serve 
```
Then start `qx serve` and browse to [http://localhost:8082](http://localhost:8080).  You will see that you now have a new application listed, the "API Viewer", that you can click on the link to run

## Developing API Viewer
Clone this repo and compile it:

```
    $ git clone https://github.com/qooxdoo/qooxdoo-api-viewer
    $ cd qooxdoo-api-viewer
    $ qx serve
```
Then open [http://localhost:8080](http://localhost:8080)


