#!/bin/bash

cp docker-compose.yml.example docker-compose.yml
export OD_TOKEN=`cat /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1`
sed -i.bak s/no_token/$OD_TOKEN/ docker-compose.yml

docker-compose up -d
