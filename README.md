# protractr
A constraint-based 2D Sketching tool - [Hosted on Github Pages](https://n-wach.github.io/protractr/src/)

Functionality is planned to match basic Solidworks sketches containing Points, 
Lines, Circles, and Arcs.  Most of Solidworks' relations are currently supported, 
with the remaining to be implemented soon.


Examples:
- [Arcs](ttps://n-wach.github.io/protractr/src/?arcs.json)
- [Pyramid](ttps://n-wach.github.io/protractr/src/?pyramid.json)
- [Kite](ttps://n-wach.github.io/protractr/src/?kite.json)

<details>
    <summary>Supported relations</summary>
    <ul>
        <li>Horizontal</li>
        <li>Vertical</li>
        <li>Colinear</li>
        <li>Tangent Line</li>
        <li>Tangent Circle</li>
        <li>Concentric</li>
        <li>Midpoint</li>
        <li>Intersection</li>
        <li>Coincident on Point</li>
        <li>Coincident on Line</li>
        <li>Coincident on Circle</li>
        <li>Radius Equal</li>
        <li>Line Length Equal</li>
    </ul>
</details>
<details>
    <summary>Missing relations</summary>
    <ul>
        <li>Perpendicular</li>
        <li>Parallel</li>
        <li>Fix / Lock Entity</li>
    </ul>
</details>

## Structure and Documenation

[View the docs!](https://n-wach.github.io/protractr/docs)

Protractr is composed of two main modules:
 - `gcs` is used to describe and solve geometric sketches, which are 
 composed of figures and relations.
 - `ui` displays the current sketch and allows a user to modify it


## Contributing

To get started:

1.  Clone this repo, and `cd` into it

2.  Run `npm install`

3.  Make changes to the TypeScript source.  This should be done under the `src` 
    directory.  Note that the `dist` directory is the product of `browserify` and 
    `tsc`, and you should not directly edit files there.
    
4.  To test your changes, run:

    ```
    npm run recompile-typescript
    npm run browserify
    ```

    You should then see that the file `dist/bundle.js` has been modified.  
    This is the final JavaScript file that the running application actually 
    uses: a combination of all the JavaScript in the application, together with 
    the node modules on which the application depends.

5. When you are ready to commit a change, regenerate the docs:

    ```
    npm run gen-docs
    ```
    
    Then, commit the changes under `src` and `docs`, and plus the changes to 
    `dist/bundle.js`.  We commit `docs` and `dist/bundle.js` because they are used by 
    the GitHub Pages hosted production version of the site.

