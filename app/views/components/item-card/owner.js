/**
 * @jsx React.DOM
 */

var React = require('react')
var crypto = require('crypto')

var Owner = React.createClass({

  getAvatar: function(email) {
    var hash = crypto.createHash('md5')
    hash.update(email.toLowerCase().trim())
    var url = 'http://www.gravatar.com/avatar/' + hash.digest('hex') + '.jpg?d=identicon&s=36'
    return <img src={url} />
  },

  defaultImage: function() {
    return <img src="http://placehold.it/36x36" />
  },

  getName: function() {
    return this.props.person === 'unassigned' ?
      'Unassigned' : this.props.person.first_name + ' ' + this.props.person.last_name.substr(0,1)
  },

  render: function() {
    return (
      <div className="item-card__owner-avatar">
        {this.props.person === 'unassigned' ? this.defaultImage() : this.getAvatar(this.props.person.email)}
      </div>
    )
  }
})

module.exports = Owner
