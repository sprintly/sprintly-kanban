import _ from 'lodash';
import React from 'react/addons';
import {Modal,Nav,NavItem} from 'react-bootstrap';
import {MentionsInput, Mention} from 'react-mentions';

var AddItemModal = React.createClass({
  getInitialState() {
    return {
      type: 'story',
      description: ""
    }
  },

  getDefaultProps() {
    return {
      members: [
        {
          id: 'John Doe',
          display: 'John Doe'
        }
      ]
    }
  },

  onChange(ev, value) {
    this.setState({ description: value });
  },

  onSelect(type) {
    this.setState({ type: type });
  },

  renderStoryTitle() {

    let who = (
      <div className="add-item__field who">
        <span>As an</span>
        <div className="input-group">
          <label>Who</label>
          <input className="form-control" type="text" name="who" placeholder="e.g. accountant"/>
        </div>
      </div>
    );

    let what = (
      <div className="add-item__field what">
        <span>I want</span>
        <div className="input-group">
          <label>What</label>
          <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration"/>
        </div>
      </div>
    );

    let why = (
      <div className="add-item__field why">
        <span>so that</span>
        <div className="input-group">
          <label>Why</label>
          <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration"/>
        </div>
      </div>
    );

    return [who, what, why];
  },

  renderTitle() {
    return (
      <input className="form-control" placeholder="What is it?" name="title"/>
    );
  },

  render() {
    const NAV_ITEMS = [
      { type: 'story', label: 'Story' },
      { type: 'task', label: 'Task' },
      { type: 'defect', label: 'Defect' },
      { type: 'test', label: 'Test' },
    ];

    return (
      <Modal {...this.props} className="add-item">
        <Nav className="add-item__tabs" bsStyle='tabs' activeKey={this.state.type} onSelect={this.onSelect}>
          {_.map(NAV_ITEMS, function(item) {
            return (
              <NavItem eventKey={item.type} className={`add-item__nav-${item.type}`}>
                {item.label}
              </NavItem>
            )
          })}
        </Nav>
        <div className="modal-body">
          <form>
            <div className="form-group">
            {this.state.type === 'story' ? this.renderStoryTitle() : this.renderTitle()}
            </div>
            <div className="form-group">
              <MentionsInput value={this.state.description} onChange={this.onChange} placeholder="Add a description and drag files here to attach...">
                <Mention data={this.props.members} />
              </MentionsInput>
            </div>
            <div className="form-group">
              <input className="form-control" type="text" name="tags" placeholder="Tags"/>
            </div>

            <div className="row">
              <div className="col-sm-7">
              </div>
              <div className="col-sm-5 add-item__actions">
                <button className="btn btn-primary btn-lg">Create Item</button>
                <button className="btn btn-default btn-lg">Cancel</button>
                <div className="checkbox">
                  <label>
                    <input type="checkbox" name="backlog" checked/>
                    Automatically send to backlog.
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
});

export default AddItemModal;
