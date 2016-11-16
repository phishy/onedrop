#!/bin/bash

(cd ui; npm install)
(cd ui; bower install)
(cd ui; ionic build android)
