# protractr
A constraint-based 2D Sketching tool - [Hosted on Github Pages](https://n-wach.github.io/protractr/src/)

Functionality is planned to match basic Solidworks sketches containing Points, Lines, and Circles.  Most of Solidworks' relations are currently supported, with the remaining to be implemented soon.

Supported relations:
- [x] Horizontal
- [x] Vertical
- [x] Colinear
- [x] Tangent Line
- [x] Tangent Circle
- [x] Concentric
- [x] Midpoint
- [x] Intersection
- [x] Coincident on Point
- [x] Coincident on Line
- [x] Coincident on Circle
- [x] Radius Equal
- [x] Line Length Equal
- [ ] Perpendicular
- [ ] Parallel
- [ ] Fix / Lock Entity

## Structure and Documenation

[View the docs!](https://n-wach.github.io/protractr/docs)

Protractr is composed of two main modules:
 - `gcs` is used to describe and solve geometric sketches, which are composed of figures and relations.
 - `ui` displays the current sketch and allows a user to modify it


## Contributing

To get started:

1.  clone this repo, and cd into it
2.  `npm install`
3.  Make changes to typescript source.  This should be done under the `src` directory.  Note that the `dist` directory is the product of `browserify` and `tsc`, and you should not directly edit files there.
4.  To test your changes, run:

    ```
    ./node_modules/typescript/bin/tsc
    npm run browserify
    ```

    You should then see that the file `dist/bundle.js` has been modified.  This is the final JavaScript file that the running application actually uses: a combination of all the JavaScript in the application, together with the node modules on which the application depends.

5. When you are ready to commit a change, regenerate the docs:

    ```
    npm run gen-docs
    ```
    
    Then, commit the changes under `src` and `docs`, and plus the changes to `dist/bundle.js`.  We commit `docs` and `dist/bundle.js` because they are used by the GitHub Pages hosted production version of the site.

