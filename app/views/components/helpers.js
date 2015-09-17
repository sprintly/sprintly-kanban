import _ from 'lodash'

export default {
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
  formatForSelect(options) {
    var values = _.keys(options)

    return _.map(values, (value) => {
      return {label: this.toTitleCase(value), value: value}
    })
  },

  formatStatusesForSelect(options) {
    return _.map(options, (value, key) => {
      return {label: this.toTitleCase(value), value: key}
    })
  },

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

  toTitleCase(str) {
    if (str) {
      return str.replace(/\w\S*/g, function(text){
        return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
      })
    } else {
      return ''
    }
  },

  vowelSound(word) {
    let firstLetter = word.charAt(0).toLowerCase()
    let vowelSounds = ['a','e','i','o']

    return _.contains(vowelSounds, firstLetter)
  },

  itemStatusMap(status) {
    var ITEM_STATUS_MAP = {
      'in-progress': 'current',
      'completed': 'done',
      'someday': 'someday',
      'backlog': 'backlog',
      'accepted': 'accepted'
    }

    return ITEM_STATUS_MAP[status]
  },

  formatTextForMarkdown(description) {
    let names = internals.parseNames(description)
    let ids = internals.parseIds(description)

    if (names && ids) {
      let links = internals.buildLinks(ids, names)
      var merged = _.map(_.zip(names,ids), function(pair) {return pair[0]+pair[1]})

      _.each(merged, function(merge, i) {
        description = description.replace(merge, links[i])
      })

      return description
    } else {
      return description
    }
  }
}

var internals = {
  parseNames(text) {
    return text.match(/@\[(.*?)\]/g)
  },

  parseIds(text) {
    return text.match(/\((.*?)\)/g)
  },

  buildLinks(ids, names) {
    /*
      Member link format: https://sprint.ly/product/24067/organizer/?members=19470
    */
    let strippedIds = internals.strippedIds(ids)
    let strippedNames = internals.strippedNames(names)

    return _.map(strippedIds, function(id, i) {
      return `[${strippedNames[i]}](https://sprint.ly/product/24067/organizer/?members=${id})`
    })
  },

  strippedIds(ids) {
    return _.map(ids, (id) => {
      let matches = id.match(/:(.+?)\)/)
      if (matches) {
        return matches[1]
      }
    })
  },

  strippedNames(names) {
    return _.map(names, (id) => {
      let matches =  id.match(/@\[(.+?)\]/)
      if (matches) {
        return matches[1]
      }
    })
  }
}
