#The dockerfile for Wikilogic's API node server

# Pull base image - we're running it on Ubuntu!
FROM node

WORKDIR /var/www/api/
#copy the package.json & install
COPY ./package.json .
COPY ./package-lock.json .
# COPY ./node_modules /var/www/api/node_modules
RUN npm install
RUN npm install pm2 -g
RUN npm install nodemon -g

#copy the api code into that directory
COPY ./api-server.js .
COPY ./src ./src

COPY ./guestlist.js .

# Define default command. Using pm2 to run the API in production http://pm2.keymetrics.io/
# CMD ["pm2-docker", "api-server.js"]
CMD ["nodemon", "api-server.js", "-L"]

# Expose ports.
EXPOSE 3030