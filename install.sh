#!/bin/bash

git submodule update --init
cp docker-compose.yml.example docker-compose.yml
docker-compose up -d

docker exec -it onedrop_mongo_1 mongo onedrop /var/onedrop/install.js
docker-compose logs
