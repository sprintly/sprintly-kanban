var Hapi = require('hapi');
var server = new Hapi.Server();
var path = require('path');

server.connection({
  host: '0.0.0.0',
  port: 3600
});

server.views({
  engines: {
    html: require('swig')
  },
  path: path.join(__dirname, 'views'),
  isCached: process.env === 'production',
  compileOptions: {
    isPretty: true
  }
});

server.register([
  {
    register: require('good'),
    options: {
      opsInterval: 1000,
      reporters: [
        {
          reporter: require('good-console'),
          args: [{ log: '*', response: '*' }]
        }
      ]
    }
  },
  require('./lib/sprintly-oauth')
], function(err) {
  if (err) {
    throw err;
  }
});

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      auth: 'session'
    },
    handler: function(request, reply) {
      reply.view('layout.html', {
        token: request.auth.credentials.token
      })
    }
  },
  {
    method: 'GET',
    path: '/{p*}',
    handler: {
      directory: {
        path: './public'
      }
    }
  }
]);

server.start(function() {
  console.log('server started on port 3600');
});
