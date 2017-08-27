#The dockerfile for Wikilogic's API node server

# Pull base image - we're running it on Ubuntu!
FROM node

WORKDIR /var/www/api/
#copy the package.json & install
COPY ./package.json package.json
COPY ./node_modules /var/www/api/node_modules
RUN npm install

#copy the api code into that directory
COPY ./api-server.js ./api-server.js
COPY ./src ./src

# Define default command.
CMD ["node", "api-server.js"]

# Expose ports.
EXPOSE 3030