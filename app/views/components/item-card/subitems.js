import _ from 'lodash';
import React from 'react/addons';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';

var SubItem = React.createClass({

  propTypes: {
    subitems: React.PropTypes.array.isRequired,
    productId: React.PropTypes.number.isRequired,
    parentId: React.PropTypes.number.isRequired
  },

  updateSubItem(subitem, ev) {
    var status;
    if (_.contains(['someday', 'backlog', 'in-progress'], subitem.status)) {
      status = 'accepted';
    } else if (_.contains(['completed', 'accepted'], subitem.status)) {
      status = 'in-progress';
    }

    ProductActions.updateItem(
      subitem.product.id,
      subitem.number,
      _.assign({}, subitem, { status }),
      { wait: false }
    );
  },

  createSubItem(ev) {
    ev.preventDefault();
    let node = this.refs.addItemInput.getDOMNode();
    let title = node.value;
    ItemActions.addItem(this.props.productId, {
      title,
      type: 'task',
      parent: this.props.parentId
    });
  },

  renderSubItem(subitem, i) {
    let checked = subitem.status === 'completed' || subitem.status === 'accepted';
    return (
      <li key={i} className={`item-card__subitem-detail ${subitem.type}`}>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={checked} onChange={_.partial(this.updateSubItem, subitem)} />
            <span>
              <a href={subitem.short_url} target="_BLANK" className="small">#{subitem.number}</a> {subitem.title}
            </span>
          </label>
        </div>
      </li>
    );
  },

  render() {
    let addItemText = this.props.subitems.length > 0 ?
      'Add another task' : 'Add a task';

    return (
      <div className="col-sm-12 item-card__subitems">
        {this.props.subitems.length < 1 ? '' :
          <ul>
          {_.map(this.props.subitems, this.renderSubItem)}
          </ul>
        }
        <form className="item-card__add-subitem" onSubmit={this.createSubItem}>
          <input ref="addItemInput" type="text" placeholder={addItemText} className="form-control" />
          <button className="btn btn-default">+</button>
        </form>
      </div>
    );
  }
});

export default SubItem;

