# This dockerfile is intended for running the API in Travis CI - not for production.
FROM node

WORKDIR /var/www/api/

# Install the API in /var/www/api/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

# Copy the api files in
COPY ./api.js ./api.js
COPY ./src ./src

CMD ["node", "api.js"]

# Expose ports.
EXPOSE 3030