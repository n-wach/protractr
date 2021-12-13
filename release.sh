#!/bin/bash

set -e

rm -rf dist
rm -rf docs

npm run recompile-typescript
npm run browserify
npm run gen-docs

rm -rf temp
mkdir temp
cp -r dist temp/
cp -r docs temp/
cp -r examples temp/
cp -r image temp/
cp -r styles temp/
cp index.html temp/

git checkout gh-pages

rm -rf dist docs examples image styles index.html
mv temp/* .

git add .
git commit -m "Release for GitHub Pages"
git push

git checkout main
rm -rf temp
rm -rf dist
rm -rf docs
