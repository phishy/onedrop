#!/bin/bash

(cd ui; npm install)
(cd ui; bower install)
(cd ui; ionic platform add ios)
(cd ui; ionic resources)
(cd ui; ionic build ios && cp AppDelegate.m platforms/ios/onedrop/Classes/)

# add signing team
# add audio, background fetch capabilitites
