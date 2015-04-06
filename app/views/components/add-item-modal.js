import _ from 'lodash';
import React from 'react/addons';
import {Modal,Nav,NavItem} from 'react-bootstrap';

var AddItemModal = React.createClass({
  getInitialState() {
    return {
      activeTab: 'story'
    }
  },

  render() {
    const NAV_ITEMS = [
      { type: 'story', label: 'Story' },
      { type: 'task', label: 'Task' },
      { type: 'defect', label: 'Defect' },
      { type: 'test', label: 'Test' },
    ];

    return (
      <Modal {...this.props} backdrop={false} animation={false} className="add-item">
        <Nav className="add-item__tabs" bsStyle='tabs' activeKey={this.state.activeTab}>
          {_.map(NAV_ITEMS, function(item) {
            return <NavItem eventKey={item.type}>{item.label}</NavItem>
          })}
        </Nav>
        <div className="modal-body">
          <form>
            <div className="form-group">
              <div className="add-item__field who">
                <span>As an</span>
                <div className="input-group">
                  <label>Who</label>
                  <input className="form-control" type="text" name="who" placeholder="e.g. accountant"/>
                </div>
              </div>
              <div className="add-item__field what">
                <span>I want</span>
                <div className="input-group">
                  <label>What</label>
                  <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration"/>
                </div>
              </div>
              <div className="add-item__field why">
                <span>so that</span>
                <div className="input-group">
                  <label>Why</label>
                  <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration"/>
                </div>
              </div>
            </div>
            <div className="form-group">
              <textarea className="form-control" placeholder="Add a description and drag files here to attach..."></textarea>
            </div>
            <div className="form-group">
              <input className="form-control" type="text" name="tags" placeholder="Tags"/>
            </div>
            <button className="btn btn-primary">Create Item</button>
            <button className="btn btn-default">Cancel</button>
          </form>
        </div>
      </Modal>
    );
  }
});

export default AddItemModal;
