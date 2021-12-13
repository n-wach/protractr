# protractr
A constraint-based 2D Sketching tool - [View on Github Pages](https://n-wach.github.io/protractr)

Functionality is planned to match basic Solidworks sketches containing Points, 
Lines, Circles, and Arcs.  Most of Solidworks' relations are currently supported, 
with the remaining to be implemented soon.

Examples:
- [Arcs](https://n-wach.github.io/protractr?arcs.json)
- [Pyramid](https://n-wach.github.io/protractr?pyramid.json)
- [Kite](https://n-wach.github.io/protractr?kite.json)

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
 - `gcs` is used to describe and solve geometric sketches, which are composed 
of figures and relations.
 - `ui` displays the current sketch and allows a user to modify it

## Contributing

To get started:

1. Clone this repo, and `cd` into it

2. Run `npm install`

3. Make changes to the TypeScript source.  This should be done under `scripts` 
   directory.

4. To test your changes, run:
   ```
   npm run recompile-typescript
   npm run browserify
   ```
   You should then see that the file `dist/bundle.js` has been created/updated.
   This is a single JavaScript combining all of the compiled TypeScript. 
   To view your changes, open `index.html` in a browser.

5. Ignore changes to `dist` and `docs` when committing changes.

6. To make a new release on Github Pages, run `release.sh`. This will
   recompile `dist/bundle.js`, as well as generate the docs. Then, the
   changes will be moved to the `gh-pages` branch and pushed to Github.
