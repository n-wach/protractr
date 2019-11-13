# protractr
### [A constraint based SVG designer](https://ccs-1l-f19.github.io/protractr/src)

Protractr is composed of two main modules:
 - `gcs` is used to describe and solve geometric sketches, which are composed of figures and constraints.
 - `ui` displays the current sketch and allows a user to modify it

The project is written in typescript.  The typescript is compiled into `dist/` as a series of Node modules by `tsconfig.json`.  Then, `browserify` combines all required modules into a single `bundle.js`.  This `bundle.js` can be served to the client by `index.html`.

Modifying a typescript file in `src/` requires recompiling the typescript and rerunning `browserify` (see `package.json` for full command).  Webstorm has good typescript integration and `browserify` can easily be added as a pre-browser-launch npm script.

The latest version is hosted at [ccs-1l-f19.github.io/protractr/src](https://ccs-1l-f19.github.io/protractr/src)


# Developer Info

To get started:

1.  clone this repo, and cd into it
2.  npm install browserify
3.  npm install typescript
4.  Make changes to typescript source.  This should be done under the `src` directory.

    Note that the `dist` directory is the product of doing `browserify` and `tsc`, and you should not directly edit
    files there.
    
5.  Run:

    ```
    ./node_modules/typescript/bin/tsc
    npm run browserify
    ```

    Alternatively, you can use `npm install -g typescript`, in which case the `tsc` command is installed globally
    for your operating system.

    You should then see that the file `dist/bundle.js` has been modified.  This is the final JavaScript file that the
    running application actually uses: it is the combination of all the custom JavaScript in the application, together with
    the node modules on which the application depends.

    If you are commiting the change, commit both the changes under `src` plus the changes to `dist/bundle.js`.

    The reason that we commit `dist/bundle.js` is that it is used by the GitHub Pages hosted production version of the site.



