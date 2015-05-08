# Sprintly Kanban

> Oauth2 Client App w/ Hapi, React, Flux, and Sprinlty-Data

[![wercker status](https://app.wercker.com/status/01a6dce093261e014308a7e7af9fd5c7/m/master "wercker status")](https://app.wercker.com/project/bykey/01a6dce093261e014308a7e7af9fd5c7)

[Production - https://kanban.sprint.ly](https://kanban.sprint.ly)
[Staging - https://sprintly-manifold.herokuapp.com](https://sprintly-manifold.herokuapp.com)

## Setup

**Prerequisites**

* **Create an Oauth Client** through the Sprintly admin with the credentials
in `config/default.js`
* node >= 0.10 and npm
* Sprint.ly API running on https://local.sprint.ly:9000/

```bash
$ make install
```

## Local Development

```bash
$ node server
server started on port 3600
```

Browserify/Less watch task:

```bash
$ make watch
```

Run tests and coverage report with Karma:

```bash
$ npm test
```

Run tests to run in a browser:

```bash
$ make test-server
```

## Deploys

Kanban is built to be deployed on Heroku with a minimum amount of fuss. Because
Heroku is the deploy target, all assets for production need to be compiled and
checked in. To avoid this, we use
[Wercker](https://app.wercker.com/project/bykey/01a6dce093261e014308a7e7af9fd5c7)
to build and cache production assets and then push them to Heroku when we need
to deploy.

#### Staging

Deploys to staging should be managed with the "Deploy" button in Wercker or
with the Wercker CLI tool. You can deploy to staging from any branch.

#### Production

Production deploys can also be managed with Wercker in the same fashion as
staging.

There's a new feature in Heroku called
[pipelines](https://devcenter.heroku.com/articles/labs-pipelines) that can also
be used to manage deploys. Using the Heroku toolbelt you can promote a build
from staging to production. The benefit is that you don't have to wait for the
deploy step since Heroku transfers the environment directly.

```bash
heroku pipeline:promote
```

## Architectural Decisions

Backbone collections and models will live as implementation details of the store, not in views. [Document here](https://docs.google.com/a/quickleft.com/document/d/128zIqfwTGUDdFF38nH-CD4IHVNFkbiZqoDGN8p-rmbw/edit#heading=h.1491m6n30hmq)

Dependencies between Stores should be resolved with the Flux Dispatcher `waitFor` mechanism. [Document here](https://docs.google.com/a/quickleft.com/document/d/1zUSyoRTvRBleuU2FTvnnRqhaS-tcM1ACcabqahiOkMk/edit)

Pusher connections should be managed by a class with access to the app Dispatcher. [Document here](https://docs.google.com/a/quickleft.com/document/d/17bfOLwwM1avXcr7u3qMZPfJt1pMOv1r3VaLUiejbME4/edit)
