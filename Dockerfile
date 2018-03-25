# This dockerfile is intended for running the API in Travis CI - not for production.
FROM node

WORKDIR /var/www/api/

# Install the API in /var/www/api/
WORKDIR /var/www/api/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install

# Copy the api files in
COPY ./api-server.js ./api-server.js
COPY ./src ./src

CMD ["node", "api-server.js"]

# Expose ports.
EXPOSE 3030