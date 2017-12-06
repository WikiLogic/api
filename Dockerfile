#The dockerfile for Wikilogic's API node server

# Pull base image - we're running it on Ubuntu!
FROM node

# set the working directory within the container
WORKDIR /var/www/api/

#copy the package.json files
COPY /var/www/wikilogic/api/package.json package.json
COPY /var/www/wikilogic/api/package-lock.json package-lock.json

# install nodemon to run node
RUN npm install nodemon -g

# Define default command. Using pm2 to run the API in production http://pm2.keymetrics.io/
# CMD ["pm2-docker", "api-server.js"]
CMD ["nodemon", "api-server.js"]

# Share the code with the host system so that updates can be faster
VOLUME ["/var/www/api/api-server.js", "/var/www/api/src"]

# Expose ports.
EXPOSE 3030