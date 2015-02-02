#!/bin/bash

echo "Switching to branch master .."
git checkout master

echo "Executing gulp .."
gulp

echo "Copying from dist/ to tmp-dist/ .."
cp -R dist tmp-dist

echo "Switching to branch gh-pages .."
git checkout gh-pages

echo "Copying from tmp-dist/ to ./ .."
cp -R tmp-dist/app/* ./

read -p "Enter a commit message: " commitMessage

git commit -am "$commitMessage"

echo "Pushing to remote branch gh-pages .."
git push origin gh-pages

echo "Removing directory tmp-dist/ .."
rm -rf tmp-dist

echo "Switching back to branch master .."

git checkout master
