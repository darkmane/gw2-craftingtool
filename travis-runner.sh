#!/bin/bash
set -o pipefail

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]
then
  echo "Deploying!" && \
  sed -i.tmp "s/\/\/ app.baseUrl = '\/polymer-starter-kit/app.baseUrl = '\/polymer-starter-kit/" app/scripts/app.js && \
  rm app/scripts/app.js.tmp && \
  bower i && \
  gulp build-deploy-gh-page && \
  sed -i.tmp "s/app.baseUrl = '\/polymer-starter-kit/\/\/ app.baseUrl = '\/polymer-starter-kit/" app/scripts/app.js && \
  rm app/scripts/app.js.tmp
else
  npm run lint
  npm test
fi