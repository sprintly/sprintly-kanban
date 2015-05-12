import _ from 'lodash';
import React from 'react/addons';
import {Input} from 'react-bootstrap';
import ProductActions from '../../../actions/product-actions';

var SubItem = React.createClass({

  propTypes: {
    subitems: React.PropTypes.array.isRequired
  },

  updateSubItem(subitem, ev) {
    let status;
    if (_.contains(['someday', 'backlog', 'in-progress'], subitem.status)) {
      status = 'accepted';
    } else if (_.contains(['completed', 'accepted'], subitem.status)) {
      status = 'in-progress';
    }
    subitem.stats = status;


    ProductActions.updateItem(
      subitem.product.id,
      subitem.number,
      _.assign({}, subitem, { status })
    );
  },

  renderSubItem(subitem, i) {
    let checked = subitem.status === 'completed' || subitem.status === 'accepted';
    return (
      <li key={i} className={`item-card__subitem-detail ${subitem.type}`}>
        <div className="checkbox">
          <label>
            <input type="checkbox" defaultChecked={checked} onChange={_.partial(this.updateSubItem, subitem)} />
            <span>
              <a href={subitem.short_url} target="_BLANK" className="small">#{subitem.number}</a> {subitem.title}
            </span>
          </label>
        </div>
      </li>
    );
  },

  render() {
    return (
      <div className="col-sm-12 item-card__subitems">
        <ul>
        {_.map(this.props.subitems, this.renderSubItem, this)}
        </ul>
      </div>
    );
  }
});

export default SubItem;

