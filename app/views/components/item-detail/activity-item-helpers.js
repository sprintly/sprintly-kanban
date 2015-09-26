import helpers from '../../components/helpers';

const ITEM_CLOSE_MAP = {
  10: 'invalid',
  20: 'fixed',
  30: 'duplicate',
  40: 'incomplete',
  50: 'wont fix',
  60: 'works for me'
}

const SCORE_TO_SHIRT_SIZES = {
  0: '~',
  1: 'S',
  3: 'M',
  5: 'L',
  8: 'XL',
}

const STATUS_MAP = {
  5: 'someday',
  10: 'backlog',
  20: 'current',
  30: 'complete',
  40: 'accepted'
}

const ACTIVITY_TYPES = {
  'item created': 'created this',
  'item changed': 'updated',
  'attachment': 'attached',
  'assigned': 'reassigned',
  '': 'commented'
}

module.exports = {
  attachmentDesc(data) {
    var pre = helpers.vowelSound(data.type) ? 'An ' : 'A ';
    let type = helpers.toTitleCase(data.type);

    return `${pre} ${type}: ${data.title}`;
  },

  fieldToValueMap(data) {
    let oldVal;
    let newVal;

    switch (data.field) {
      case 'score':
        oldVal = SCORE_TO_SHIRT_SIZES[data.old];
        newVal = SCORE_TO_SHIRT_SIZES[data.new];

        break;
      case 'status':
        oldVal = STATUS_MAP[data.old];
        newVal = STATUS_MAP[data.new];

        break;
      default:
        oldVal = data.old;
        newVal = data.new;
        break;
    }


    return {
      oldVal,
      newVal
    }
  },

  activityTypeMap(action) {
    return ACTIVITY_TYPES[action];
  },

  authorName(author) {
    return `${author.first_name} ${author.last_name.charAt(0)}.`
  },

  itemReassigned(meta) {
    let from;
    let to = `to ${this.authorName(meta.new)}`

    if (meta.old) {
      from = `from ${this.authorName(meta.old)}`
    }

    return [from, to].join(' ');
  },
}
