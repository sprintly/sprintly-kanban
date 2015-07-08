import _ from 'lodash';
import React from 'react/addons';

var stubRouterContext = (Component, props, stubs) => {
  function RouterStub() {}

  _.assign(RouterStub, {
    makePath () {},
    makeHref () {},
    transitionTo () {},
    replaceWith () {},
    goBack () {},
    getCurrentPath () {},
    getCurrentRoutes () {},
    getCurrentPathname () {},
    getCurrentParams () {},
    getCurrentQuery () {},
    isActive () {},
    getRouteAtDepth() {},
    setRouteComponentAtDepth() {}
  }, stubs);

  return React.createClass({
    childContextTypes: {
      router: React.PropTypes.func,
      routerDepth: React.PropTypes.number
    },

    getChildContext: function() {
      return {
        router: RouterStub,
        routerDepth: 0
      }
    },

    render: function() {
      return <Component ref='stub' {...props} />;
    }
  });
};

export default stubRouterContext;
