#!/bin/bash

npm install ionic -g
(cd ui; npm install)
(cd ui; bower install)
(cd ui; ionic platform add android)
(cd ui; ionic resources)
(cd ui; ionic build android)
