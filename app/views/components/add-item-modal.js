import _ from 'lodash';
import React from 'react/addons';
import {Modal,Nav,NavItem} from 'react-bootstrap';
import {MentionsInput, Mention} from 'react-mentions';
import {SelectorMenu} from 'sprintly-ui';
import {Tokenizer} from 'react-typeahead';

var AddItemModal = React.createClass({

  mixins: [
    React.addons.LinkedStateMixin
  ],

  getInitialState() {
    return {
      type: 'story',
      title: '',
      who: '',
      what: '',
      why: '',
      description: '',
      tags: [],
      assigned_to: null,
      sendToBacklog: true,
    }
  },

  propTypes: {
    tags: React.PropTypes.array,
    members: React.PropTypes.array,
    product: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      members: [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe'
        }
      ]
    }
  },

  setDescription(ev, value) {
    this.setState({ description: value });
  },

  updateTags(tags) {
    this.setState({ tags });
  },

  changeType(type) {
    this.setState({ type: type });
  },

  dismiss(ev) {
    ev.preventDefault();
    this.props.onRequestHide(ev);
  },

  createItem(ev) {
    ev.preventDefault();
    let item = _.pick(this.state, ['type', 'description', 'tags', 'assigned_to'])

    if (this.state.type === 'story') {
      _.assign(item, _.pick(this.state, ['who', 'what', 'why']))
    } else {
      item.title = this.state.title;
    }

    if (this.state.addToBacklog) {
      item.status = 'backlog';
    }
  },

  renderStoryTitle() {
    let who = (
      <div className="add-item__field who">
        <span>As an</span>
        <div className="input-group">
          <label>Who</label>
          <input className="form-control" type="text" name="who" placeholder="e.g. accountant" valueLink={this.linkState('who')}/>
        </div>
      </div>
    );

    let what = (
      <div className="add-item__field what">
        <span>I want</span>
        <div className="input-group">
          <label>What</label>
          <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration" valueLink={this.linkState('what')}/>
        </div>
      </div>
    );

    let why = (
      <div className="add-item__field why">
        <span>so that</span>
        <div className="input-group">
          <label>Why</label>
          <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration" valueLink={this.linkState('why')}/>
        </div>
      </div>
    );

    return [who, what, why];
  },

  renderTitle() {
    return (
      <input className="form-control" placeholder="What is it?" name="title" valueLink={this.linkState('title')}/>
    );
  },

  renderMembersDropdown: function() {
    let active = _.findWhere(this.props.members, { id: this.state.assignee });
    let selection = active ? `${active.first_name} ${active.last_name.slice(0,1)}.` : 'Unassigned';
    let members = _.map(this.props.members, function(member) {
      let title = `${member.first_name} ${member.last_name.slice(0,1)}.`;
      return {
        title,
        id: member.id
      }
    }, this);

    return (
      <div className="form-group selector" key="members-dropdown">
        <SelectorMenu
          optionsList={_.sortBy(members, 'title')}
          selection={selection}
          onSelectionChange={(title) => {
            this.setState({
              assigned_to: _.findWhere(members, { title }).id
            });
          }}
        />
      </div>
    );
  },

  render() {
    const NAV_ITEMS = [
      { type: 'story', label: 'Story' },
      { type: 'task', label: 'Task' },
      { type: 'defect', label: 'Defect' },
      { type: 'test', label: 'Test' },
    ];

    let mentions = _.map(this.props.members, function(member) {
      return {
        id: member.id,
        display: `${member.first_name} ${member.last_name.slice(0,1)}.`
      }
    });

    let tags = _.pluck(this.props.tags, 'tag');

    return (
      <Modal {...this.props} className="add-item">
        <Nav className="add-item__tabs" bsStyle='tabs' activeKey={this.state.type} onSelect={this.changeType}>
          {_.map(NAV_ITEMS, function(item) {
            return (
              <NavItem eventKey={item.type} className={`add-item__nav-${item.type}`}>
                {item.label}
              </NavItem>
            )
          })}
        </Nav>
        <div className="modal-body">
          <form onSubmit={this.createItem}>
            <div className="form-group">
              {this.state.type === 'story' ? this.renderStoryTitle() : this.renderTitle()}
            </div>
            <div className="form-group">
              <MentionsInput
                value={this.state.description}
                onChange={this.setDescription}
                placeholder="Add a description and drag files here to attach...">
                  <Mention data={mentions} />
              </MentionsInput>
            </div>
            <div className="form-group">
              <Tokenizer
                className="add-item__tags"
                options={tags}
                onTokenAdd={this.updateTags}
                onTokenRemove={this.updateTags}
                customClasses={{
                  token: 'label label-default'
                }}
                placeholder="Tags" />
            </div>
            <div className="row">
              <div className="col-xs-7">
                {this.renderMembersDropdown()}
              </div>
              <div className="col-xs-5 add-item__actions">
                <input type="submit" className="btn btn-primary btn-lg" value="Create Item"/>
                <button className="btn btn-default btn-lg" onClick={this.dismiss}>Cancel</button>
                <div className="checkbox">
                  <label>
                    <input type="checkbox" name="backlog" checkedLink={this.linkState('sendToBacklog')}/>
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
