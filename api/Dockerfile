FROM node

WORKDIR /var/onedrop/api
COPY . /var/onedrop/api
RUN npm install --no-progress && npm install sails -g
ENTRYPOINT /var/onedrop/api/entrypoint.sh
