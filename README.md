# protractr
### [A constraint based SVG designer](https://ccs-1l-f19.github.io/protractr/src)

Protractr is composed of two main modules:
 - `gcs` is used to describe and solve geometric sketches, which are composed of figures and constraints.
 - `ui` displays the current sketch and allows a user to modify it

The project is written in typescript.  The typescript is compiled into `dist/` as a series of Node modules by `tsconfig.json`.  Then, `browserify` combines all required modules into a single `bundle.js`.  This `bundle.js` can be served to the client by `index.html`.

Modifying a typescript file in `src/` requires recompiling the typescript and rerunning `browserify` (see `package.json` for full command.  Webstorm has good typescript integration and `browserify` can easily be added as a pre-browser-launch npm script.

The latest version is hosted at [ccs-1l-f19.github.io/protractr/src](https://ccs-1l-f19.github.io/protractr/src)
