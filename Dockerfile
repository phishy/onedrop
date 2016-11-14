FROM node

RUN apt-get update
RUN apt-get install -y eyed3

RUN npm install -g local-web-server

ENTRYPOINT /var/onedrop/entrypoint.sh
