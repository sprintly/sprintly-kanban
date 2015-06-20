# Sprintly Kanban

> Oauth2 Client App w/ Hapi, React, Flux, and Sprinlty-Data

[![wercker status](https://app.wercker.com/status/43e50b14b2bd09d40a96c8bb04b095c8/m/master "wercker status")](https://app.wercker.com/project/bykey/43e50b14b2bd09d40a96c8bb04b095c8)

* [Production - https://kanban.sprint.ly](https://kanban.sprint.ly)
* [Staging - https://sprintly-manifold.herokuapp.com](https://sprintly-manifold.herokuapp.com)

## Setup

**Prerequisites**

* **Create an OAuth Client** through the Sprintly admin with the credentials
in `config/default.js`
* node >= 0.10 and npm
* Sprint.ly API running on https://local.sprint.ly:9000/

```bash
$ make
```

## Local Development

To use and develop Sprintly Kanban locally, you'll need an Oauth `CLIENT_ID`
and `CLIENT_SECRET`. Currently our public registration for new OAuth apps is
closed, but we are accepting requests for new OAuth Client application by
emailing [support@sprint.ly](mailto:support@sprint.ly).

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
$ npm run watchify-test
```

#### npm shrinkwrap

This project uses `npm shrinkwrap` to keep dependecies from automatically
upgrading without out explicit permission.

**Any time you install or upgrade an npm package, please run `make shrinkwrap`**.

For further reading, please refer to the shrinkwrap documentation: `npm help shrinkwrap`.

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
