# Sprintly 5 Columns

> Oauth2 Client App w/ Hapi, React, Flux, and Sprinlty-Data

## Setup

**Prerequisites**

* **Create an Oauth Client** through the Sprintly admin with the credentials
in `config/default.js`

* node >= 0.10 and npm

```bash
$ make install
```

```bash
$ node server
server started on port 3600
```

Browserify/Less watch task:

```bash
$ gulp
```

Run tests:

```bash
$ npm test
```

## Architectural Decisions

Backbone collections and models will live as implementation details of the store, not in views. [Document here](https://docs.google.com/a/quickleft.com/document/d/128zIqfwTGUDdFF38nH-CD4IHVNFkbiZqoDGN8p-rmbw/edit#heading=h.1491m6n30hmq)

