import React from 'react/addons';
import _ from 'lodash';
import ItemDetailMixin from './detail-mixin';
import ItemHeader from './item-header';
import {State} from 'react-router'
import ProductActions from '../../../actions/product-actions';

var ItemFollowers = React.createClass({

  mixins: [State, ItemDetailMixin],

  propTypes: {
    followers: React.PropTypes.array,
    setItem: React.PropTypes.func
  },

  followItem() {
    console.log('Follow the item');
  },

  followerNodes() {
    if (this.props.followers) {
      return _.map(this.props.followers, (follower, i) => {
        return (
          <div key={i} className="col-xs-4">
            <li><Gravatar email={follower.email} size={36} /></li>
          </div>
        )
      })
    } else {
      return <div className="no-followers">No followers of this item yet</div>
    }
  },

  render() {
    let followerNodes = this.followerNodes();

    return (
      <div className="col-xs-3 followers">
        <ItemHeader title='followers' />
        <ul>
          {followerNodes}
        </ul>
        <button className="detail-button kanban-button-secondary" onClick={this.followItem}>Follow</button>
      </div>
    )
  }
})

export default ItemFollowers;
