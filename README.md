# Wikilogic API

[![Build Status](https://travis-ci.org/WikiLogic/api.svg?branch=master)](https://travis-ci.org/WikiLogic/api)

This is an express app to serve the Wikilogic API. You're in one of sevoral repos used to organise the Wikilogic project.

## Get it running

The easiest way, which requires Docker, is to clone and run the [Infastructure repo](https://github.com/WikiLogic/infrastructure). That references this repo as a git submodule so you woudln't need to clone this repo directly.

Alternativly you can run this the usual way with `npm install` and `npm start` although you will need to have ArangoDB running locally. Either installed on your system or through the [Arango docker image](https://hub.docker.com/r/arangodb/arangodb/).

---

## Database Connection

Some environment variabls are expected to allow this express app to connect to a database:

```js
const host = process.env.ARANGODB_HOST || "arango";
const port = process.env.ARANGODB_PORT || "8529";
const database = process.env.ARANGODB_DB || "wl_dev";
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
```

---

## Help needed!

* [ ] list things here we need help with!
* [ ] split users out into their own db, I'm thinking mongo? Is that nuts?
* [ ] Debug the travis.yml file - it's running and seems to be passing random tests. Something's up!
* [ ] build this API into it's own docker image on dockerhub

---

Some Axioms to start:

"Everything in the universe glows with the light of it's internal heat."

---

https://github.com/kelyvin/express-env-example/blob/master/server/routes/apis/index.js

org time!

Can we make / should we make it more functional? Dive into the routes then functional function at the end?

tweak to do: https://itnext.io/using-async-await-to-write-cleaner-route-handlers-7fc1d91b220b

https://sailsjs.com/get-started todo - make a quick mock of wl with that, might solve all the auth things and give us a boost :)
