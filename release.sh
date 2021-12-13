#!/bin/bash

git checkout gh-pages

rm -rf dist
rm -rf docs

npm run recompile-typescript
npm run browserify
npm run gen-docs

git add dist
git add docs
git add index.html
git add .nojekyll
git add image
git add examples

git commit -m "Release for GitHub Pages"
git push

git checkout main
