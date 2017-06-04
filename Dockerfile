#The dockerfile for Wikilogic's API node server

# Pull base image - we're running it on Ubuntu!
FROM node

# Install Node
# RUN apt-get update
# RUN apt-get install -y nodejs
#RUN rm -rf /var/lib/apt/lists/*
#RUN chown -R www-data:www-data /var/lib/nginx

WORKDIR /var/www/api/
#copy the package.json & install
COPY ./package.json package.json
RUN npm install

#copy the api code into that directory
COPY ./api-server.js ./api-server.js
COPY ./read ./read
COPY ./write ./write
COPY ./neo4j ./neo4j

# Define mountable directories.
#VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/app"]

# Define default command.
CMD ["node", "api-server.js"]

# Expose ports.
EXPOSE 3030