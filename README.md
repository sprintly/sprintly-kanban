# Sprintly 5 Columns

> Oauth2 Client App w/ Hapi, React, Flux, and Sprinlty-Data

[![wercker status](https://app.wercker.com/status/01a6dce093261e014308a7e7af9fd5c7/m "wercker status")](https://app.wercker.com/project/bykey/01a6dce093261e014308a7e7af9fd5c7)

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

