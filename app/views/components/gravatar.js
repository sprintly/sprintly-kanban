var React = require('react/addons');
var crypto = require('crypto');

var Gravatar = React.createClass({

  propTypes: {
    email: React.PropTypes.string,
    size: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      size: 36
    };
  },

  getAvatar: function(email) {
    var hash = crypto.createHash('md5')
    hash.update(this.props.email.toLowerCase().trim())
    var url = `//www.gravatar.com/avatar/${hash.digest('hex')}.jpg\
      ?d=identicon&s=${this.props.size}`;
    return <img src={url} {...this.props} />;
  },

  render: function() {
    return this.props.email != null ?
      this.getAvatar(this.props.email) : <span />;
  }
});

module.exports = Gravatar;

