import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State} from 'react-router'
import ProductActions from '../../../actions/product-actions';
import Markdown from 'react-markdown';

const placeholder = "Use '@' to mention another Sprintly user.  Use #[item number] (e.g. #1234) to reference another Sprintly item.";

var ItemDescription = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    itemId: React.PropTypes.number,
    description: React.PropTypes.string,
    members: React.PropTypes.array,
    setItem: React.PropTypes.func
  },

  getInitialState() {
    return {
      descriptionEditable: false
    }
  },

  saveItemDescription() {
    const DESCRIPTION_ATTR = 'description';
    this.toggleDescriptionEdit();
    this.updateAttribute(this.props.itemId, DESCRIPTION_ATTR, this.props.description)
  },

  descriptionMention() {
    let mentionsComponent = this.mentionsComponent(this.props.description, placeholder, this.props.members, _.partial(this.props.setItem, 'description'));

    return ([
        mentionsComponent,
        this.toggleButton(null, this.saveItemDescription)
      ]
    )
  },

  formatDescriptionForMarkdown(description) {
    let names = this.parseNames(description);
    let ids = this.parseIds(description);

    if (names && ids) {
      let links = this.buildLinks(ids, names);
      var merged = _.map(_.zip(names,ids), function(pair) {return pair[0]+pair[1]});

      _.each(merged, function(merge, i) {
        description = description.replace(merge, links[i])
      })

      return description;
    } else {
      return description
    }
  },

  parseNames(text) {
    return text.match(/@\[(.*?)\]/g)
  },

  parseIds(text) {
    return text.match(/\((.*?)\)/g);
  },

  buildLinks(ids, names) {
    /*
      Link format: https://sprint.ly/product/24067/organizer/?members=19470
    */
    let strippedIds = this.strippedIds(ids);
    let strippedNames = this.strippedNames(names);

    return _.map(strippedIds, function(id, i) {
      return `[${strippedNames[i]}](https://sprint.ly/product/24067/organizer/?members=${id})`;
    })
  },

  strippedIds(ids) {
    return _.map(ids, (id) => {
      return id.match(/:(.+?)\)/)[1]
    });
  },

  strippedNames(names) {
    return _.map(names, (id) => {
      return id.match(/@\[(.+?)\]/)[1]
    });
  },

  descriptionMarkdown() {
    let description = this.props.description;

    if (!description) {
      description = `_${placeholder}_`;
    } else {
      description = this.formatDescriptionForMarkdown(description);
    }
    let markdown = <Markdown source={description} />

    return ([
        markdown,
        this.toggleButton("min-button-alignment", this.toggleDescriptionEdit)
      ]
    )
  },

  toggleButton(alignmentClass, clickHandler) {
    let classes = `col-md-2 description__control collapse-right pull-right ${alignmentClass}`
    let buttonCopy = this.state.descriptionEditable ? 'Save' : 'Edit';

    return (
      <div className={classes}>
        <button className="detail-button kanban-button-secondary" onClick={clickHandler}>
          {buttonCopy}
        </button>
      </div>
    )
  },

  toggleDescriptionEdit() {
    this.setState({descriptionEditable: !this.state.descriptionEditable});
  },

  render: function() {
    let descriptionEl = this.state.descriptionEditable ? this.descriptionMention() : this.descriptionMarkdown();

    let descriptionClasses = React.addons.classSet({
      "col-md-12": true,
      "item__description": true,
      "collapse-left": this.state.descriptionEditable
    })

    return (
      <div className={descriptionClasses}>
        {descriptionEl}
      </div>
    )
  }

});

export default ItemDescription;
