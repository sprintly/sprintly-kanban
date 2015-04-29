import _ from 'lodash';
import React from 'react/addons';

var stubRouterContext = (Component, props, stubs) => {
  return React.createClass({
    childContextTypes: {
      makePath: React.PropTypes.func,
      makeHref: React.PropTypes.func,
      transitionTo: React.PropTypes.func,
      replaceWith: React.PropTypes.func,
      goBack: React.PropTypes.func,
      getCurrentPath: React.PropTypes.func,
      getCurrentRoutes: React.PropTypes.func,
      getCurrentPathname: React.PropTypes.func,
      getCurrentParams: React.PropTypes.func,
      getCurrentQuery: React.PropTypes.func,
      isActive: React.PropTypes.func,
      getRouteAtDepth: React.PropTypes.func,
      setRouteComponentAtDepth: React.PropTypes.func,
      routeDepth: React.PropTypes.number
    },

    getChildContext: function() {
      return _.extend({
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
        setRouteComponentAtDepth() {},
        routeDepth: 0
      }, stubs);
    },

    render: function() {
      return <Component ref='stub' {...props} />;
    }
  });
};

export default stubRouterContext;