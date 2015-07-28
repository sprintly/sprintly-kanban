import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State} from 'react-router'
import ProductActions from '../../../actions/product-actions';
import Markdown from 'react-markdown';

const placeholder = "Use '@' to mention another Sprintly user.  Use #[item number] (e.g. #1234) to reference another Sprintly item.";

var TicketDescription = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    followers: React.PropTypes.array,
    description: React.PropTypes.string,
    setItem: React.PropTypes.func
  },

  getInitialState() {
    return {
      descriptionEditable: false
    }
  },

  buildFollowers() {
    let followerNodes;
    if (this.props.followers) {
      followerNodes = _.map(this.props.followers, (follower, i) => {
        return (
          <div key={i} className="col-md-4">
            <li><Gravatar email={follower.email} size={36} /></li>
          </div>
        )
      })
    } else {
      followers = (
        <div className="no-followers">No followers of this item yet</div>
      )
    }

    return (
      <div className="col-md-3 followers">
        {this.header('followers')}
        <ul>
          {followerNodes}
        </ul>
        <button className="detail-button kanban-button-secondary" onClick={this.followItem}>Follow</button>
      </div>
    )
  },

  followItem() {
    console.log('Follow the item');
  },

  saveItem(value) {
    // Display some spinner action
    this.toggleDescriptionEdit();
    let productId = this.getParams().id;
    let itemId = this.getParams().number;

    ProductActions.updateItem(productId, itemId, { description: this.props.description });
  },

  descriptionMention() {
    let mentionsComponent = this.mentionsComponent(this.props.description, placeholder, _.partial(this.props.setItem, 'description'));

    return ([
        mentionsComponent,
        <div className="col-md-2 description__control collapse-right pull-right">
          <button className="detail-button kanban-button-secondary" onClick={this.saveItem}>
            Save
          </button>
        </div>
      ]
    )
  },

  descriptionMarkdown() {
    let markdown = <Markdown source={this.props.description} />

    return ([
        markdown,
        <div className="col-md-2 description__control collapse-right pull-right">
          <button className="detail-button kanban-button-secondary" onClick={this.toggleDescriptionEdit}>
            Edit
          </button>
        </div>
      ]
    )
  },

  toggleDescriptionEdit() {
    this.setState({descriptionEditable: !this.state.descriptionEditable});
  },

  render: function() {
    let followers = this.buildFollowers();
    let descriptionEl = this.state.descriptionEditable ? this.descriptionMention() : this.descriptionMarkdown();

    let descriptionClasses = React.addons.classSet({
      "col-md-9": true,
      "item__description": true,
      "collapse-left": this.state.descriptionEditable
    })

    return (
      <div className="col-md-12 section description">
        <div className="col-md-12">
          {this.header('description')}
          <div className={descriptionClasses}>
            {descriptionEl}
          </div>
          {followers}
        </div>
      </div>
    )
  }

});

export default TicketDescription;
