#The dockerfile for Wikilogic's API node server

# Pull base image - we're running it on Ubuntu!
FROM node

WORKDIR /var/www/api/
#copy the package.json & install
COPY ./package.json package.json
RUN npm install

#copy the api code into that directory
COPY ./api-server.js ./api-server.js
COPY ./read ./read
COPY ./write ./write
COPY ./neo4j ./neo4j

# Define default command.
CMD ["node", "api-server.js"]

# Expose ports.
EXPOSE 3030