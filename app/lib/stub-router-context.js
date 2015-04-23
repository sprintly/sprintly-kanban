import _ from 'lodash';
import React from 'react/addons';

var stubRouterContext = (Component, props, stubs) => {
  return React.createClass({
    childContextTypes: {
      transitionTo: React.PropTypes.func,
      getCurrentPath: React.PropTypes.func,
      getCurrentRoutes: React.PropTypes.func,
      getCurrentPathname: React.PropTypes.func,
      getCurrentParams: React.PropTypes.func,
      getCurrentQuery: React.PropTypes.func
    },

    getChildContext: function() {
      return _.extend({
        transitionTo () {},
        getCurrentPath () {},
        getCurrentRoutes () {},
        getCurrentPathname () {},
        getCurrentParams () {},
        getCurrentQuery () {}
      }, stubs);
    },

    render: function() {
      return <Component ref='stub' {...props} />;
    }
  });
};

export default stubRouterContext;
