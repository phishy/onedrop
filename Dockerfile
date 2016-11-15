FROM node

RUN apt-get update
RUN npm install -g local-web-server bower

ENTRYPOINT /var/onedrop/entrypoint.sh
