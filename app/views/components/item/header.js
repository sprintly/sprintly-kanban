/**
 * @jsx React.DOM
 */

var React = require('react')
var crypto = require('crypto')

var ItemHeader = React.createClass({

  getAvatar: function(email) {
    var hash = crypto.createHash('md5')
    hash.update(email.toLowerCase().trim())
    var url = 'http://www.gravatar.com/avatar/' + hash.digest('hex') + '.jpg?d=identicon&s=18'
    return <img src={url} />
  },

  defaultImage: function() {
    return <img src="https://sprintly-wasatch.global.ssl.fastly.net/3229/static/images/unassigned_icon_18.png" />
  },

  getName: function() {
    return this.props.person === 'unassigned' ?
      'Unassigned' : this.props.person.first_name + ' ' + this.props.person.last_name.substr(0,1)
  },

  render: function() {
    return (
      <header>
        {this.props.person === 'unassigned' ? this.defaultImage() : this.getAvatar(this.props.person.email)}
        <small>{this.getName()}</small>
      </header>
    )
  }
})

module.exports = ItemHeader
