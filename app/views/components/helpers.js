var _ = require('lodash');

module.exports = {
  formatMentionMembers(members) {
    return _.map(members, function(member) {
      return {
        id: `pk:${member.id}`,
        display: `${member.first_name} ${member.last_name}`
      }
    })
  },
  /*
    TODO: Add test coverage
  */
  formatSelectMembers(members) {
    return _.chain(members)
            .map(function(member){
              if (!member.revoked) {
                return {label: `${member.first_name} ${member.last_name}`, value: member.id}
              }
            })
            .compact()
            .value()
  },

  toTitleCase: function(str) {
    return str.replace(/\w\S*/g, function(text){
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });
  },
}
