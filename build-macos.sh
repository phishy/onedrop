#!/bin/bash

npm install npm -g
npm install bower -g
npm install electron -g
npm install electron-packager -g

npm install
(cd api && npm install)
(cd ui && bower install)
