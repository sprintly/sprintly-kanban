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
      return {
        label: this.toTitleCase(value),
        value: value
      }
    })
  },

  formatStatusesForSelect(options) {
    return _.map(options, (value, key) => {
      return {
        label: this.toTitleCase(value),
        value: key
      }
    })
  },

  formatSelectMembers(members) {
    return _.chain(members)
            .map(function(member){
              if (!member.revoked) {
                return {
                  label: `${member.first_name} ${member.last_name}`,
                  value: member.id
                }
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
    let vowelSounds = ['a','e','i','o','u']

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

  formatTextForMarkdown(text, productId) {
    let names = internals.parseNames(text)
    let ids = internals.parseIds(text)
    let links = internals.parseLinks(text)

    if (names && ids) {
      let memberLinks = internals.buildMemberLinks(ids, names, productId)
      var merged = _.map(_.zip(names,ids), function(pair) {
        return pair[0]+pair[1]
      })

      _.each(merged, function(merge, i) {
        text = text.replace(merge, memberLinks[i])
      })
    }
    if (links) {
      text = internals.replaceWithContentLinks(text, links)
    }

    return text
  },

  formatLinksForMarkdown(text) {
    return text
  }
}

var internals = {
  replaceWithContentLinks(text, links) {
    let contentLinks = internals.buildContentLinks(links)
    _.each(contentLinks, function(contentLink, i) {
      text = text.replace(links[i], contentLink)
    })

    return text
  },

  parseNames(text) {
    return text.match(/@\[(.*?)\]/g)
  },

  parseIds(text) {
    return text.match(/\((.*?)\)/g)
  },

  parseLinks(text) {
    return text.match(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g)
  },

  buildContentLinks(links) {
    return _.map(links, function(link) {
      return `[${link}](${link})`
    })
  },

  buildMemberLinks(ids, names, productId) {
    /*
      Member link format: https://sprint.ly/product/24067/organizer/?members=19470
    */
    let strippedIds = internals.strippedIds(ids)
    let strippedNames = internals.strippedNames(names)

    return _.map(strippedIds, function(id, i) {
      return `[${strippedNames[i]}](https://sprint.ly/product/${productId}/organizer/planning?members=${id}&order=priority)`
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

module.exports.internals = internals
