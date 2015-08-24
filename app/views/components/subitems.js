import React from 'react/addons';
import _ from 'lodash';
import Subitem from './subitem';
import ProductActions from '../../actions/product-actions';
import ItemActions from '../../actions/item-actions';

var Subitems = React.createClass({

  propTypes: {
    subitems: React.PropTypes.array.isRequired,
    createItem: React.PropTypes.func.isRequired,
    deleteItem: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.func,
    ]),
    updateItem: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.func,
    ])
  },

  subitemsList() {
    if (this.props.subitems.length) {
      let subitems = _.map(this.props.subitems, (subitem, i) => {
        let checked = subitem.status === 'completed' || subitem.status === 'accepted';

        return (
          <Subitem key={i}
          listPosition={i}
               subitem={subitem}
            deleteItem={this.props.deleteItem}
            updateItem={this.props.updateItem}
               checked={checked} />
        )
      }, this);

      return (
        <ul>
          {subitems}
        </ul>
      )
    }
  },

  addItemText() {
    return this.props.subitems.length ? 'Add another task' : 'Add a task';
  },

  extractValue(ev) {
    ev.preventDefault();
    let node = this.refs.addItemInput.getDOMNode();
    if (node.value) {
      this.props.createItem(node.value);
      node.value = '';
    }
    node.focus();
  },

  newSubitemInput() {
    return (
      <form className="subitems__add-subitem" onSubmit={this.extractValue}>
        <input key="addItemInput" ref="addItemInput" type="text" placeholder={this.addItemText()} className="form-control" />
        <button type="submit" ref="createSubitem" className="btn btn-default">+</button>
      </form>
    )
  },

  render() {
    return (
      <div className="col-xs-12 subitems">
        {this.newSubitemInput()}
        {this.subitemsList()}
      </div>
    );
  }
});

export default Subitems;
