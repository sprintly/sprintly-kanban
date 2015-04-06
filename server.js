var Hapi = require('hapi');
var server = new Hapi.Server();
var path = require('path');
var config = require('config');

server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 3600
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
          args: [{ log: '*', response: '*', error: '*' }]
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

function serveApp(request, reply) {
  reply.view('layout.html', {
    token: request.auth.credentials.token
  })
}

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      auth: 'session',
      handler: serveApp
    },
  },
  {
    method: 'GET',
    path: '/search',
    config: {
      auth: 'session',
      handler: serveApp
    },
  },
  {
    method: 'GET',
    path: '/add',
    config: {
      auth: 'session',
      handler: serveApp
    },
  },
  {
    method: 'GET',
    path: '/product/{p*}',
    config: {
      auth: 'session',
      handler: serveApp
    },
  },
  {
    method: 'POST',
    path: '/pusher/auth',
    handler: {
      proxy: {
        uri: config.sprintly_api_root + '/ajax/wasatch/product_pusher_auth.json',
        passThrough: true
      }
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
